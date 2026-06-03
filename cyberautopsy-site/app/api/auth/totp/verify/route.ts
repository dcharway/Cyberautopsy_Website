import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/store";
import { verifyTotpCode } from "@/lib/auth/totp";
import { signSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PORTAL_BASE = process.env.PORTAL_URL || "http://localhost:3100";

/**
 * Step 2 (TOTP path): verify the 6-digit code; on success, issue a signed
 * session token and return the portal handoff URL.
 */
export async function POST(req: Request) {
  let body: { email?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const code = (body.code ?? "").trim();

  const user = await getUser(email);
  if (!user || !user.totpSecret || !user.totpEnrolled) {
    return NextResponse.json({ error: "TOTP not enrolled" }, { status: 400 });
  }

  if (!verifyTotpCode(code, user.totpSecret)) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  const token = signSession(email, "totp", user.role ?? "viewer");
  const callbackUrl = `${PORTAL_BASE}/auth/callback?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ ok: true, token, callbackUrl, role: user.role ?? "viewer" });
}
