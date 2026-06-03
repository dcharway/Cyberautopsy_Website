/**
 * Signed session tokens shared between the marketing site (issuer) and the
 * portal at :3100 (verifier). HMAC-SHA256 over a compact JSON payload.
 *
 * Token format: base64url(payload).base64url(signature)
 * Same SESSION_SECRET env var must be set in both apps.
 */

import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_SECRET = "dev-only-cyberautopsy-secret-do-not-use-in-prod";
const SECRET = process.env.SESSION_SECRET || DEFAULT_SECRET;

export type Role = "admin" | "demo" | "viewer";

export type SessionPayload = {
  sub: string;        // user email
  mfa: "totp" | "webauthn";
  role: Role;         // RBAC — portal pages + API endpoints gate on this
  iat: number;        // issued at, unix seconds
  exp: number;        // expires at, unix seconds
};

const ONE_HOUR = 60 * 60;

export function signSession(
  sub: string,
  mfa: SessionPayload["mfa"],
  role: Role,
  ttlSeconds = 8 * ONE_HOUR
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { sub, mfa, role, iat: now, exp: now + ttlSeconds };
  const payloadB64 = b64urlEncode(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = signRaw(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function verifySession(token: string): SessionPayload | null {
  if (typeof token !== "string" || token.indexOf(".") < 0) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;

  const expected = signRaw(payloadB64);
  if (!constantTimeEq(sig, expected)) return null;

  let parsed: SessionPayload;
  try {
    parsed = JSON.parse(b64urlDecode(payloadB64).toString("utf8"));
  } catch {
    return null;
  }

  if (typeof parsed.exp !== "number" || parsed.exp < Math.floor(Date.now() / 1000)) return null;
  if (parsed.mfa !== "totp" && parsed.mfa !== "webauthn") return null;
  if (typeof parsed.sub !== "string" || !parsed.sub) return null;
  // Tokens issued before the role field existed get defaulted to "viewer" —
  // the safest lowest-privilege bucket.
  if (parsed.role !== "admin" && parsed.role !== "demo" && parsed.role !== "viewer") {
    parsed.role = "viewer";
  }
  return parsed;
}

function signRaw(input: string): string {
  return b64urlEncode(createHmac("sha256", SECRET).update(input).digest());
}

function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function b64urlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Buffer.from(padded, "base64");
}
