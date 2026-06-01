/**
 * Password reset token generation + verification.
 *
 * - Token is 32 random bytes, base64url-encoded → 43 url-safe chars.
 * - Server only stores SHA-256 of the token; the plaintext lives only in the
 *   email link the user receives. Same approach Postgres `pgcrypto` uses for
 *   "we leaked our user table, can't reset everyone's password" scenarios.
 * - Expiry: 15 minutes from issuance.
 */

import { createHash, randomBytes, timingSafeEqual } from "crypto";

export const RESET_TTL_MS = 15 * 60 * 1000;

export function generateResetToken(): { token: string; tokenHash: string; expiresAt: string } {
  const raw = randomBytes(32);
  const token = raw.toString("base64").replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();
  return { token, tokenHash, expiresAt };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function isExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
}
