/**
 * Outbound email via Resend (https://resend.com).
 *
 * Required env on the VPS:
 *   RESEND_API_KEY  — API key from resend.com → API Keys
 *   EMAIL_FROM      — verified sender, e.g. "CyberAutopsy <no-reply@cyberautopsy.org>"
 *
 * If either is missing, sendEmail does NOT throw — it logs the full email
 * payload to stdout (which PM2 captures) and returns ok=false. That keeps
 * the API endpoint usable in dev/demo and surfaces the reset link to a
 * sysadmin who can deliver it manually.
 */

export type SendEmailResult =
  | { ok: true }
  | { ok: false; reason: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "CyberAutopsy <no-reply@cyberautopsy.org>";

  if (!apiKey) {
    // Loud, structured log so admin can scrape PM2 logs and forward manually.
    console.warn(
      [
        "[email] RESEND_API_KEY not set — email NOT sent.",
        "[email] Would have delivered:",
        `[email]   TO:      ${opts.to}`,
        `[email]   FROM:    ${from}`,
        `[email]   SUBJECT: ${opts.subject}`,
        `[email]   BODY:`,
        ...opts.text.split("\n").map((l) => `[email]   | ${l}`)
      ].join("\n")
    );
    return { ok: false, reason: "RESEND_API_KEY not configured on this server" };
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
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
        ...(opts.html ? { html: opts.html } : {}),
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {})
      })
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend rejected: HTTP ${res.status} — ${body}`);
      return { ok: false, reason: `Resend rejected (HTTP ${res.status})` };
    }

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[email] Network error reaching Resend: ${msg}`);
    return { ok: false, reason: "Network error contacting Resend" };
  }
}
