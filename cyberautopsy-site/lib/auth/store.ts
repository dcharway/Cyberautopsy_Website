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

export type WebAuthnCredential = {
  id: string;             // base64url credentialID
  publicKey: string;      // base64url public key
  counter: number;
  transports?: string[];
  label?: string;
  createdAt: string;
};

export type Role = "admin" | "demo" | "viewer";

export type User = {
  email: string;
  passwordHash: string;   // scrypt$N$saltB64$hashB64
  totpSecret: string | null;
  totpEnrolled: boolean;
  webauthn: WebAuthnCredential[];
  currentChallenge: string | null;  // transient per-flow nonce
  // Password reset: token stored as sha256 hex so the at-rest file doesn't
  // contain the verbatim secret. The plaintext only exists in the email link.
  passwordResetTokenHash: string | null;
  passwordResetExpires: string | null; // ISO date; ignore + clear if past
  // RBAC: gates assessment / import-export / admin features in the portal.
  // Missing = treated as "viewer" (lowest privilege).
  role: Role;
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
      passwordHash: hashPassword(DEMO_PASSWORD),
      totpSecret: DEMO_TOTP_SECRET,
      totpEnrolled: true,
      webauthn: [],
      currentChallenge: null,
      passwordResetTokenHash: null,
      passwordResetExpires: null,
      role: "demo",
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
  if (ADMIN_PASSWORD && !cache.users[ADMIN_EMAIL]) {
    cache.users[ADMIN_EMAIL] = {
      email: ADMIN_EMAIL,
      passwordHash: hashPassword(ADMIN_PASSWORD),
      totpSecret: ADMIN_TOTP_SECRET,
      totpEnrolled: true,
      webauthn: [],
      currentChallenge: null,
      passwordResetTokenHash: null,
      passwordResetExpires: null,
      role: "admin",
      createdAt: new Date().toISOString()
    };
    await persist();
    console.warn(`[auth/store] Seeded admin user: ${ADMIN_EMAIL}`);
  }

  // Backfill new fields on existing users so old stores stay compatible
  for (const u of Object.values(cache.users)) {
    if (u.passwordResetTokenHash === undefined) u.passwordResetTokenHash = null;
    if (u.passwordResetExpires === undefined) u.passwordResetExpires = null;
    if (u.role === undefined) {
      // Existing stores: demo user gets 'demo', anything else defaults to 'viewer'.
      // Re-seed admin gets handled by the seed block above on first read.
      u.role = u.email.toLowerCase() === DEMO_EMAIL ? "demo" : "viewer";
    }
  }
  return cache;
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

export async function setUserChallenge(email: string, challenge: string | null): Promise<void> {
  const u = await getUser(email);
  if (!u) throw new Error("User not found");
  u.currentChallenge = challenge;
  await upsertUser(u);
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
