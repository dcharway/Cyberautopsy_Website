import { NextResponse } from "next/server";
import { clean, dispatchIntake, isValidCage, isValidEmail } from "@/lib/intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lead magnet intake — "5 Controls That Fail 80% of Contractors" brief.
 * Validates email + CAGE, then dispatches to the firm and (optionally) sends
 * the brief to the prospect. The actual brief delivery is a follow-up email
 * from a partner, not an automation, per the brand voice.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = clean(body.email).toLowerCase();
  const cage = clean(body.cage).toUpperCase();
  const honeypot = clean(body.website);

  if (honeypot) return NextResponse.json({ ok: true });

  if (!isValidEmail(email)) return NextResponse.json({ error: "Valid work email required" }, { status: 400 });
  if (!isValidCage(cage)) return NextResponse.json({ error: "CAGE code must be 5 alphanumeric characters" }, { status: 400 });

  const subject = `[Brief request] ${cage} — ${email}`;
  const bodyText = [
    "New gated-brief request: 'The 5 Controls That Fail 80% of Contractors'",
    "",
    `Email: ${email}`,
    `CAGE:  ${cage}`,
    "",
    "Send the brief from a partner address, with a one-line opener.",
    "Do not enroll in any automation."
  ].join("\n");

  const result = await dispatchIntake({ subject, bodyText, replyTo: email });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
