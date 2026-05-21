/**
 * RFC 6238 TOTP. Hand-rolled to avoid otplib's ESM/Next bundling pitfalls.
 * Defaults: SHA-1, 6 digits, 30-second step, ±1 step skew tolerance.
 */

import { createHmac, randomBytes } from "crypto";

const STEP_SECONDS = 30;
const DIGITS = 6;
const SKEW = 1; // accept code from previous/next window too

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/* ---------- base32 ---------- */

export function encodeBase32(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }
  return output;
}

export function decodeBase32(s: string): Buffer {
  const clean = s.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx < 0) throw new Error(`Invalid base32 character: ${ch}`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/* ---------- TOTP core ---------- */

function hotp(secret: Buffer, counter: number): string {
  // 64-bit big-endian counter
  const counterBuf = Buffer.alloc(8);
  // JS bitwise ops are 32-bit, but our counter fits easily in 32 bits for current epochs
  counterBuf.writeUInt32BE(0, 0);
  counterBuf.writeUInt32BE(counter >>> 0, 4);

  const hmac = createHmac("sha1", secret).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const code = bin % 10 ** DIGITS;
  return code.toString().padStart(DIGITS, "0");
}

export function generateTotpSecret(): string {
  // 20 bytes = 160 bits = 32 base32 chars
  return encodeBase32(randomBytes(20));
}

export function totpProvisioningUri(secret: string, accountLabel: string, issuer = "CyberAutopsy") {
  const label = encodeURIComponent(`${issuer}:${accountLabel}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(STEP_SECONDS)
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function currentTotpCode(secret: string): string {
  const key = decodeBase32(secret);
  const counter = Math.floor(Date.now() / 1000 / STEP_SECONDS);
  return hotp(key, counter);
}

export function verifyTotpCode(code: string, secret: string): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  let key: Buffer;
  try {
    key = decodeBase32(secret);
  } catch {
    return false;
  }
  const counter = Math.floor(Date.now() / 1000 / STEP_SECONDS);
  for (let i = -SKEW; i <= SKEW; i++) {
    const candidate = hotp(key, counter + i);
    if (constantTimeStringEq(candidate, code)) return true;
  }
  return false;
}

function constantTimeStringEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
