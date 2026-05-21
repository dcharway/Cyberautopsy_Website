import { NextResponse } from "next/server";
import { clean, dispatchIntake, isValidCage, isValidEmail } from "@/lib/intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const company = clean(body.company);
  const cage = clean(body.cage).toUpperCase();
  const segment = clean(body.segment);
  const cui = clean(body.cui);
  const contractValue = clean(body.contractValue);
  const email = clean(body.email).toLowerCase();
  const honeypot = clean(body.website); // bot trap, see Contact form

  if (honeypot) {
    // Looks like a bot; respond OK so the bot moves on.
    return NextResponse.json({ ok: true });
  }

  if (!company) return NextResponse.json({ error: "Company is required" }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Valid work email required" }, { status: 400 });
  if (!isValidCage(cage)) return NextResponse.json({ error: "CAGE code must be 5 alphanumeric characters" }, { status: 400 });

  const subject = `[Intake] ${company} — ${segment || "Unspecified segment"} — ${cage}`;
  const bodyText = [
    "New Contract Risk Audit intake submission.",
    "",
    `Company:          ${company}`,
    `CAGE code:        ${cage}`,
    `Segment:          ${segment || "—"}`,
    `Handles CUI:      ${cui || "—"}`,
    `Contract value:   ${contractValue || "—"}`,
    `Work email:       ${email}`,
    "",
    "Routed via cyberautopsy.com /api/contact"
  ].join("\n");

  const result = await dispatchIntake({ subject, bodyText, replyTo: email });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
