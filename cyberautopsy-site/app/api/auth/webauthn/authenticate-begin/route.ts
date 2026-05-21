import { NextResponse } from "next/server";
import { buildAuthenticationOptions } from "@/lib/auth/webauthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  try {
    const options = await buildAuthenticationOptions(email);
    return NextResponse.json(options);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to build authentication options";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
