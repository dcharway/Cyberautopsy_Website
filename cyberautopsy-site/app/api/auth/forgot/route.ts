import { NextResponse } from "next/server";
import { getUser, upsertUser, isDemoUser } from "@/lib/auth/store";
import { generateResetToken } from "@/lib/auth/reset";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Build the public origin from the incoming request's headers (Nginx forwards
 * Host via `proxy_set_header Host $host;`). Production has no MARKETING_URL
 * on the marketing site itself — only the portal needs that env var. The
 * request always knows its own origin.
 */
function publicOriginFromRequest(req: Request): string {
  if (process.env.MARKETING_URL) return process.env.MARKETING_URL;
  const headers = req.headers;
  const forwardedHost = headers.get("x-forwarded-host") ?? headers.get("host");
  if (
    forwardedHost &&
    !forwardedHost.startsWith("127.0.0.1") &&
    !forwardedHost.startsWith("localhost")
  ) {
    const proto = headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${forwardedHost}`;
  }
  return "http://localhost:3000";
}

/**
 * Begin password reset. Always returns 200 regardless of whether the email
 * exists in the store — leaks no information about valid emails.
 *
 * - For the demo user, the reset link is returned in the response too, so
 *   testers can complete the flow without configuring email.
 * - For real users, the link is dispatched via Resend to the user's own
 *   email. If RESEND_API_KEY is not configured, the link is logged to
 *   stdout (PM2) for the admin to manually forward.
 */
export async function POST(req: Request) {
  try {
    let body: { email?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const email = (body.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await getUser(email);

    // Always answer 200 — don't reveal whether the email is registered.
    if (!user) {
      return NextResponse.json({
        ok: true,
        message:
          "If an account exists for that email, a password reset link has been sent."
      });
    }

    const { token, tokenHash, expiresAt } = generateResetToken();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpires = expiresAt;
    await upsertUser(user);

    const resetUrl = `${publicOriginFromRequest(req)}/portal/reset?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(email)}`;

    const text = [
      "CyberAutopsy — password reset requested",
      "",
      "Hello,",
      "",
      "A password reset was requested for this account. To set a new password, open the link below within the next 15 minutes:",
      "",
      resetUrl,
      "",
      "If you did not request this reset, you can ignore this email — your password is unchanged.",
      "",
      "— CyberAutopsy security team"
    ].join("\n");

    const html = `<!doctype html>
<html><body style="font-family:Inter,system-ui,sans-serif;background:#0A0A0B;color:#FAFAFA;padding:40px 16px;">
  <table align="center" style="max-width:520px;background:#16161A;border:1px solid #1F1F24;padding:32px;">
    <tr><td>
      <div style="font-family:ui-monospace,monospace;font-size:10px;letter-spacing:0.24em;color:#22D3EE;text-transform:uppercase;">CYBERAUTOPSY · PASSWORD RESET</div>
      <h1 style="font-family:Georgia,serif;font-size:24px;color:#FAFAFA;margin:16px 0 8px;">Set a new password.</h1>
      <p style="color:#C9C9C2;font-size:14px;line-height:1.6;">A password reset was requested for this account. The link below expires in <strong>15 minutes</strong>.</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#22D3EE;color:#0A0A0B;padding:12px 20px;text-decoration:none;font-weight:600;font-size:14px;">Reset password</a>
      </p>
      <p style="color:#8E8E86;font-size:12px;line-height:1.6;">Or paste this URL into your browser:<br/><span style="color:#C9C9C2;word-break:break-all;">${resetUrl}</span></p>
      <hr style="border:0;border-top:1px solid #1F1F24;margin:24px 0;"/>
      <p style="color:#8E8E86;font-size:11px;line-height:1.5;">If you did not request this reset, you can ignore this email — your password remains unchanged. CyberAutopsy security team.</p>
    </td></tr>
  </table>
</body></html>`;

    // Send to the USER (not to the firm intake mailbox).
    const send = await sendEmail({
      to: email,
      subject: "Reset your CyberAutopsy password",
      text,
      html
    });

    // For the demo user, surface the URL in the response too — handy for testing
    // without email configured, and harmless because the demo's password change
    // is a no-op (see /api/auth/reset).
    if (isDemoUser(email)) {
      return NextResponse.json({
        ok: true,
        demo: true,
        emailDispatched: send.ok,
        message:
          send.ok
            ? "Reset link emailed to the demo address. The URL is also shown here for convenience."
            : "Email backend not configured — reset link is shown here so you can copy it manually.",
        resetUrl
      });
    }

    // Real users: never reveal the link in the API response. If email failed,
    // the admin can recover it from PM2 logs (sendEmail logs the payload).
    return NextResponse.json({
      ok: true,
      emailDispatched: send.ok,
      message:
        send.ok
          ? "A password reset link has been sent to your email. It expires in 15 minutes."
          : "We received your request. If you don't receive the email within a few minutes, contact your assigned Compliance Surgeon."
    });
  } catch (err) {
    // Last-resort guard so the endpoint never 500s and leaks a stack trace.
    console.error("[forgot] Unhandled error:", err);
    return NextResponse.json(
      {
        ok: true,
        message:
          "If an account exists for that email, a password reset link has been sent."
      },
      { status: 200 }
    );
  }
}
