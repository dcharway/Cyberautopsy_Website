/**
 * File-backed user store. JSON file at .data/auth-store.json (gitignored).
 *
 * Demo user is seeded on first read so the portal is usable immediately
 * without an enrollment dance. In production, swap this for a real DB.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export type Role = "admin" | "demo" | "viewer";

/**
 * Subscription lifecycle states — mirror Stripe subscription statuses so we
 * can 1:1 project webhook events onto this field.
 * https://stripe.com/docs/api/subscriptions/object#subscription_object-status
 */
export type SubscriptionStatus =
  | "none"                // no subscription ever
  | "incomplete"          // checkout started, first payment not yet succeeded
  | "trialing"
  | "active"              // paid + entitled
  | "past_due"            // failed payment, still active during retry window
  | "unpaid"              // retries exhausted, access revoked
  | "canceled"            // user cancelled; may still have access until period end
  | "expired";            // period-end reached, access revoked

export type User = {
  email: string;
  name: string | null;              // captured at self-serve registration
  organization: string | null;      // captured at self-serve registration
  passwordHash: string;             // scrypt$N$saltB64$hashB64
  totpSecret: string | null;
  totpEnrolled: boolean;
  // Password reset: token stored as sha256 hex so the at-rest file doesn't
  // contain the verbatim secret. The plaintext only exists in the email link.
  passwordResetTokenHash: string | null;
  passwordResetExpires: string | null; // ISO date; ignore + clear if past
  // Email verification for self-serve signup. Existing seeded users (demo /
  // admin) are treated as verified so we don't lock them out.
  emailVerified: boolean;
  emailVerificationTokenHash: string | null;
  emailVerificationExpires: string | null;
  // RBAC: gates assessment / import-export / admin features in the portal.
  // Missing = treated as "viewer" (lowest privilege).
  role: Role;
  // Subscription state, mirrored from Stripe webhooks.
  plan: string | null;                            // plan id (see lib/subscription/plans.ts)
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;                // ISO date
  cancelAtPeriodEnd: boolean;
  createdAt: string;
};

type Store = { users: Record<string, User> };

/**
 * Persistence path selection.
 *
 * - Dev / VPS:  ./.data/auth-store.json (project root, writable)
 * - Vercel:     /tmp/cyberautopsy-data/auth-store.json (only writable dir on serverless)
 * - Fallback:   in-memory only (a final EROFS sets writableFs=false; demo still works
 *               because the demo user is reseeded on each fresh container).
 *
 * The Vercel branch trips off the VERCEL env var that Vercel sets in every invocation.
 */
const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "auth-store.json");

// Flipped to false the first time we hit EROFS/EACCES. Stops further write attempts.
let writableFs = true;

const DEMO_EMAIL = "demo@cyberautopsy.com";
const DEMO_PASSWORD = "cyberautopsy-demo";
// Fixed TOTP secret so the same QR works across dev restarts (base32, RFC 4648).
// Display name in authenticator app: "CyberAutopsy (demo)".
const DEMO_TOTP_SECRET = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";

let cache: Store | null = null;
let writeLock: Promise<void> = Promise.resolve();

export async function loadStore(): Promise<Store> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    cache = JSON.parse(raw) as Store;
  } catch {
    cache = { users: {} };
  }
  // Seed demo user if absent
  if (!cache.users[DEMO_EMAIL]) {
    cache.users[DEMO_EMAIL] = {
      email: DEMO_EMAIL,
      name: "Demo User",
      organization: "CyberAutopsy Demo",
      passwordHash: hashPassword(DEMO_PASSWORD),
      totpSecret: DEMO_TOTP_SECRET,
      totpEnrolled: true,
      passwordResetTokenHash: null,
      passwordResetExpires: null,
      emailVerified: true,
      emailVerificationTokenHash: null,
      emailVerificationExpires: null,
      role: "demo",
      plan: null,
      subscriptionStatus: "none",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date().toISOString()
    };
    await persist();
  }

  // Seed admin user from env vars. We only seed if ADMIN_PASSWORD is set —
  // keeps the demo deployment safe by default, and lets ops bootstrap an
  // admin by adding env vars and restarting PM2.
  const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@cyberautopsy.org").toLowerCase();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN_TOTP_SECRET = process.env.ADMIN_TOTP_SECRET || DEMO_TOTP_SECRET;
  if (ADMIN_PASSWORD) {
    const existing = cache.users[ADMIN_EMAIL];
    if (!existing) {
      cache.users[ADMIN_EMAIL] = {
        email: ADMIN_EMAIL,
        name: "Platform Administrator",
        organization: "CyberAutopsy",
        passwordHash: hashPassword(ADMIN_PASSWORD),
        totpSecret: ADMIN_TOTP_SECRET,
        totpEnrolled: true,
        passwordResetTokenHash: null,
        passwordResetExpires: null,
        emailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationExpires: null,
        role: "admin",
        plan: null,
        subscriptionStatus: "none",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString()
      };
      await persist();
      console.warn(`[auth/store] Seeded admin user: ${ADMIN_EMAIL}`);
    } else {
      // Env var is source of truth — if the stored hash no longer matches
      // the current ADMIN_PASSWORD, re-hash. Without this, changing the
      // env var has no effect because the user record already exists.
      if (!verifyPassword(ADMIN_PASSWORD, existing.passwordHash)) {
        existing.passwordHash = hashPassword(ADMIN_PASSWORD);
        existing.role = "admin";
        existing.totpSecret = ADMIN_TOTP_SECRET;
        existing.totpEnrolled = true;
        await persist();
        console.warn(`[auth/store] Updated admin user password from env: ${ADMIN_EMAIL}`);
      }
    }
  }

  // Backfill new fields on existing users so old stores stay compatible.
  // Also strips vestigial `webauthn` + `currentChallenge` fields that older
  // deployments persisted before the WebAuthn feature was removed.
  // The demo + admin emails are also force-corrected — an earlier deploy
  // could have persisted role="viewer" for them, and `=== undefined` would
  // never re-correct a wrong-but-defined value.
  let dirty = false;
  for (const u of Object.values(cache.users)) {
    if (u.passwordResetTokenHash === undefined) {
      u.passwordResetTokenHash = null;
      dirty = true;
    }
    if (u.passwordResetExpires === undefined) {
      u.passwordResetExpires = null;
      dirty = true;
    }
    // Backfill self-serve registration + subscription fields on old records.
    if (u.name === undefined) { u.name = null; dirty = true; }
    if (u.organization === undefined) { u.organization = null; dirty = true; }
    if (u.emailVerified === undefined) {
      // Existing pre-signup users (demo / admin) are treated as verified.
      u.emailVerified = true;
      dirty = true;
    }
    if (u.emailVerificationTokenHash === undefined) { u.emailVerificationTokenHash = null; dirty = true; }
    if (u.emailVerificationExpires === undefined) { u.emailVerificationExpires = null; dirty = true; }
    if (u.plan === undefined) { u.plan = null; dirty = true; }
    if (u.subscriptionStatus === undefined) { u.subscriptionStatus = "none"; dirty = true; }
    if (u.stripeCustomerId === undefined) { u.stripeCustomerId = null; dirty = true; }
    if (u.stripeSubscriptionId === undefined) { u.stripeSubscriptionId = null; dirty = true; }
    if (u.currentPeriodEnd === undefined) { u.currentPeriodEnd = null; dirty = true; }
    if (u.cancelAtPeriodEnd === undefined) { u.cancelAtPeriodEnd = false; dirty = true; }
    // Vestigial WebAuthn fields — drop them so the store settles on the
    // narrower User shape.
    const bag = u as unknown as Record<string, unknown>;
    if ("webauthn" in bag) {
      delete bag.webauthn;
      dirty = true;
    }
    if ("currentChallenge" in bag) {
      delete bag.currentChallenge;
      dirty = true;
    }
    const expectedRole: Role =
      u.email.toLowerCase() === DEMO_EMAIL
        ? "demo"
        : u.email.toLowerCase() === ADMIN_EMAIL && ADMIN_PASSWORD
        ? "admin"
        : u.role ?? "viewer";
    if (u.role !== expectedRole) {
      u.role = expectedRole;
      dirty = true;
    }
  }
  if (dirty) await persist();
  return cache;
}

/* ---------- self-serve registration + subscription helpers ---------- */

/** Insert a new self-serve user in an unverified, unsubscribed state. */
export async function createUser(input: {
  email: string;
  name: string;
  organization: string;
  password: string;
}): Promise<User> {
  const s = await loadStore();
  const email = input.email.trim().toLowerCase();
  if (s.users[email]) throw new Error("An account with that email already exists.");
  const now = new Date().toISOString();
  const user: User = {
    email,
    name: input.name.trim(),
    organization: input.organization.trim(),
    passwordHash: hashPassword(input.password),
    totpSecret: null,
    totpEnrolled: false,
    passwordResetTokenHash: null,
    passwordResetExpires: null,
    emailVerified: false,
    emailVerificationTokenHash: null,
    emailVerificationExpires: null,
    role: "viewer",
    plan: null,
    subscriptionStatus: "none",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    createdAt: now
  };
  s.users[email] = user;
  await persist();
  return user;
}

/** Look up a user by Stripe customer id — used by webhook handlers. */
export async function getUserByStripeCustomerId(customerId: string): Promise<User | null> {
  const s = await loadStore();
  for (const u of Object.values(s.users)) {
    if (u.stripeCustomerId === customerId) return u;
  }
  return null;
}

/** Demo user constant — referenced from reset endpoint to keep credentials stable across resets. */
export function isDemoUser(email: string): boolean {
  return email.toLowerCase() === DEMO_EMAIL;
}

async function persist() {
  if (!writableFs) return; // already proven unwritable; stay in-memory.
  // Serialize writes to avoid file-lock races on Windows
  writeLock = writeLock.then(async () => {
    if (!cache || !writableFs) return;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const tmp = `${STORE_PATH}.tmp-${process.pid}`;
      await fs.writeFile(tmp, JSON.stringify(cache, null, 2), "utf8");
      await fs.rename(tmp, STORE_PATH);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        writableFs = false;
        console.warn(
          `[auth/store] Filesystem is read-only (${code}). Falling back to in-memory store. ` +
            "Sessions persist within this container only. For real persistence, " +
            "migrate to a database (Vercel Postgres, Vercel KV, or your own)."
        );
        return;
      }
      throw err;
    }
  });
  await writeLock;
}

export async function getUser(email: string): Promise<User | null> {
  const s = await loadStore();
  return s.users[email.toLowerCase()] ?? null;
}

export async function upsertUser(u: User): Promise<void> {
  const s = await loadStore();
  s.users[u.email.toLowerCase()] = u;
  await persist();
}

/* ---------- password hashing (scrypt) ---------- */

const SCRYPT_N = 16384;
const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_N });
  return `scrypt$${SCRYPT_N}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;
  const N = parseInt(parts[1], 10);
  const salt = Buffer.from(parts[2], "base64");
  const expected = Buffer.from(parts[3], "base64");
  const candidate = scryptSync(password, salt, expected.length, { N });
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/* ---------- demo helpers ---------- */

export const DEMO = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  totpSecret: DEMO_TOTP_SECRET,
  totpIssuer: "CyberAutopsy",
  totpLabel: "CyberAutopsy (demo)"
};

export function fingerprint(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 8);
}
