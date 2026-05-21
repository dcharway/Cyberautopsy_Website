import { NextResponse } from "next/server";
import { getUser, verifyPassword } from "@/lib/auth/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Step 1: validate email + password. Returns which MFA methods are available
 * for the user. Does NOT issue a session yet — MFA is required.
 */
export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await getUser(email);
  // Constant-time-ish: only reveal "invalid credentials" generically
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    methods: {
      totp: user.totpEnrolled,
      webauthn: user.webauthn.length > 0
    },
    webauthnCount: user.webauthn.length
  });
}
