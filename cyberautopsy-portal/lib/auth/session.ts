/**
 * Verify-side mirror of the marketing-site session signer.
 * Same SESSION_SECRET env var is required in both apps.
 *
 * Edge-runtime compatible: uses WebCrypto only, no Node crypto.
 */

const DEFAULT_SECRET = "dev-only-cyberautopsy-secret-do-not-use-in-prod";

export type SessionPayload = {
  sub: string;
  mfa: "totp" | "webauthn";
  iat: number;
  exp: number;
};

export const SESSION_COOKIE = "cyber_session";

async function signRaw(input: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(input));
  return b64urlEncode(new Uint8Array(sig));
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const secret = (typeof process !== "undefined" && process.env?.SESSION_SECRET) || DEFAULT_SECRET;
  if (typeof token !== "string" || token.indexOf(".") < 0) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;

  const expected = await signRaw(payloadB64, secret);
  if (!constantTimeEq(sig, expected)) return null;

  let parsed: SessionPayload;
  try {
    parsed = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadB64)));
  } catch {
    return null;
  }
  if (typeof parsed.exp !== "number" || parsed.exp < Math.floor(Date.now() / 1000)) return null;
  if (parsed.mfa !== "totp" && parsed.mfa !== "webauthn") return null;
  if (typeof parsed.sub !== "string" || !parsed.sub) return null;
  return parsed;
}

export function ttlSecondsFromPayload(p: SessionPayload): number {
  return Math.max(60, p.exp - Math.floor(Date.now() / 1000));
}

function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
