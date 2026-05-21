/**
 * Shared intake helpers — input validation, sanitization, and Resend dispatch.
 *
 * Both /api/contact and /api/lead-magnet share this so a single change to the
 * validation or transport layer applies to every form on the site.
 */

const MAX_FIELD = 4_000; // characters
const CAGE_RE = /^[A-Z0-9]{5}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type IntakeResult = { ok: true } | { ok: false; status: number; error: string };

export function clean(input: unknown, max = MAX_FIELD): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, max);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

export function isValidCage(value: string): boolean {
  return CAGE_RE.test(value.toUpperCase());
}

/**
 * Dispatch a plain-text email to the firm intake address via Resend.
 * Requires env vars RESEND_API_KEY and INTAKE_EMAIL.
 * Returns { ok: true } on success; on failure, returns a typed error result.
 */
export async function dispatchIntake(opts: {
  subject: string;
  bodyText: string;
  replyTo?: string;
}): Promise<IntakeResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INTAKE_EMAIL;
  const from = process.env.INTAKE_FROM ?? "CyberAutopsy Intake <intake@cyberautopsy.com>";

  if (!apiKey || !to) {
    // Without a configured backend, treat the submission as a no-op success.
    // The production rollout sets these env vars before launch.
    console.warn(
      "[intake] RESEND_API_KEY or INTAKE_EMAIL not set; submission accepted but not dispatched."
    );
    return { ok: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: opts.subject,
        text: opts.bodyText,
        reply_to: opts.replyTo
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[intake] Resend rejected dispatch", res.status, text);
      return { ok: false, status: 502, error: "Upstream email service rejected the request." };
    }

    return { ok: true };
  } catch (err) {
    console.error("[intake] Network failure dispatching to Resend", err);
    return { ok: false, status: 502, error: "Could not reach upstream email service." };
  }
}
