/**
 * Email verification token helpers.
 *
 * Same pattern as the password reset flow: the raw token is emailed to the
 * user; only the sha256 hash of it is persisted. Expiry defaults to 48 hours.
 */

import { createHash, randomBytes } from "crypto";
import { getUser, upsertUser } from "./store";

const VERIFICATION_TTL_MS = 48 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Mint a verification token, persist its hash, return the raw token. */
export async function issueVerificationToken(email: string): Promise<string> {
  const user = await getUser(email);
  if (!user) throw new Error("User not found");
  const token = randomBytes(32).toString("base64url");
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_TTL_MS).toISOString();
  await upsertUser(user);
  return token;
}

/** Consume a verification token. Returns the email on success. */
export async function consumeVerificationToken(
  email: string,
  token: string
): Promise<{ ok: true; email: string } | { ok: false; reason: string }> {
  const user = await getUser(email);
  if (!user) return { ok: false, reason: "unknown_user" };
  if (user.emailVerified) return { ok: true, email: user.email };
  if (!user.emailVerificationTokenHash || !user.emailVerificationExpires) {
    return { ok: false, reason: "no_token" };
  }
  if (new Date(user.emailVerificationExpires).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (hashToken(token) !== user.emailVerificationTokenHash) {
    return { ok: false, reason: "invalid" };
  }
  user.emailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpires = null;
  await upsertUser(user);
  return { ok: true, email: user.email };
}
