import { NextResponse } from "next/server";
import { consumeVerificationToken } from "@/lib/auth/verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  const token = body.token ?? "";
  if (!email || !token) {
    return NextResponse.json({ error: "Email and token are required." }, { status: 400 });
  }
  const result = await consumeVerificationToken(email, token);
  if (!result.ok) {
    const msg =
      result.reason === "expired"
        ? "This verification link has expired. Request a new one from the sign-in page."
        : result.reason === "invalid"
        ? "This verification link is invalid. Request a new one from the sign-in page."
        : "This verification link is no longer valid.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true, email: result.email });
}
