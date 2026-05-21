import { NextResponse } from "next/server";
import { finishRegistration } from "@/lib/auth/webauthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    response?: unknown;
    label?: string;
  };
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !body.response) {
    return NextResponse.json({ error: "Email and response required" }, { status: 400 });
  }

  try {
    const result = await finishRegistration(email, body.response, body.label);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
