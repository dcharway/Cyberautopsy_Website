import { NextResponse } from "next/server";
import { getUser, upsertUser, hashPassword, isDemoUser } from "@/lib/auth/store";
import { constantTimeEq, hashResetToken, isExpired } from "@/lib/auth/reset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_PASSWORD = 8;

/**
 * Complete the password reset.
 *   Body: { email, token, password }
 *   Validates the token against the stored sha256 hash, checks expiry,
 *   hashes the new password (scrypt), clears the reset token.
 *
 * The demo user is treated specially: the reset visibly succeeds but the
 * underlying password is not changed. This keeps the demo credentials
 * (cyberautopsy-demo) usable across testing sessions.
 */
export async function POST(req: Request) {
  let body: { email?: string; token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const token = body.token ?? "";
  const password = body.password ?? "";

  if (!email || !token || !password) {
    return NextResponse.json({ error: "Email, token, and password are required" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD} characters` },
      { status: 400 }
    );
  }

  const user = await getUser(email);
  if (!user || !user.passwordResetTokenHash || !user.passwordResetExpires) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 401 });
  }
  if (isExpired(user.passwordResetExpires)) {
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    await upsertUser(user);
    return NextResponse.json({ error: "Reset link has expired. Request a new one." }, { status: 401 });
  }

  const incomingHash = hashResetToken(token);
  if (!constantTimeEq(incomingHash, user.passwordResetTokenHash)) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 401 });
  }

  // Special case: demo user — succeed visibly, keep password stable.
  if (isDemoUser(email)) {
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    await upsertUser(user);
    return NextResponse.json({
      ok: true,
      demo: true,
      message:
        "Demo account — reset succeeded for the UI flow, but the underlying password is unchanged. Sign in with the original demo password."
    });
  }

  user.passwordHash = hashPassword(password);
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  await upsertUser(user);

  return NextResponse.json({ ok: true, message: "Password updated. You can sign in now." });
}
