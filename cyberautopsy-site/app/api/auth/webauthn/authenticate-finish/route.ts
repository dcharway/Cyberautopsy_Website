import { NextResponse } from "next/server";
import { finishAuthentication } from "@/lib/auth/webauthn";
import { signSession } from "@/lib/auth/session";
import { getUser } from "@/lib/auth/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PORTAL_BASE = process.env.PORTAL_URL || "http://localhost:3100";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; response?: unknown };
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !body.response) {
    return NextResponse.json({ error: "Email and response required" }, { status: 400 });
  }

  try {
    await finishAuthentication(email, body.response);
    const user = await getUser(email);
    const role = user?.role ?? "viewer";
    const token = signSession(email, "webauthn", role);
    const callbackUrl = `${PORTAL_BASE}/auth/callback?token=${encodeURIComponent(token)}`;
    return NextResponse.json({ ok: true, token, callbackUrl, role });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
