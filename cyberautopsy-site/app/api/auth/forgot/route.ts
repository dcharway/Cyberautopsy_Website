import { NextResponse } from "next/server";
import { getUser, upsertUser, isDemoUser } from "@/lib/auth/store";
import { generateResetToken } from "@/lib/auth/reset";
import { dispatchIntake } from "@/lib/intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Build the public origin from the incoming request's headers (Nginx forwards
 * Host via `proxy_set_header Host $host;`). Production has no MARKETING_URL
 * on the marketing site itself — only the portal needs that env var. The
 * request always knows its own origin.
 */
function publicOriginFromRequest(req: Request): string {
  // Explicit env wins — production sets MARKETING_URL on the marketing site
  // so the URL is deterministic regardless of how Nginx proxies headers.
  if (process.env.MARKETING_URL) return process.env.MARKETING_URL;
  // Dev fallback: derive from request headers
  const headers = req.headers;
  const forwardedHost = headers.get("x-forwarded-host") ?? headers.get("host");
  if (forwardedHost && !forwardedHost.startsWith("127.0.0.1") && !forwardedHost.startsWith("localhost")) {
    const proto = headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${forwardedHost}`;
  }
  return "http://localhost:3000";
}

/**
 * Begin password reset. Always returns 200 regardless of whether the email
 * exists in the store — leaks no information about valid emails.
 *
 * For the demo user, the reset link is returned in the response so the
 * end-to-end flow can be exercised without an email backend. For real
 * users, the link is dispatched via Resend (if RESEND_API_KEY is set);
 * otherwise it is logged to the server console for the admin to retrieve.
 */
export async function POST(req: Request) {
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
  // We do the token work only if the user actually exists.
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

  // Try to email the link
  const emailBody = [
    "CyberAutopsy — password reset requested",
    "",
    `Hello,`,
    "",
    "A password reset was requested for this account. To set a new password, open the link below within the next 15 minutes:",
    "",
    resetUrl,
    "",
    "If you did not request this reset, you can ignore this email — your password is unchanged.",
    "",
    "— CyberAutopsy security team"
  ].join("\n");

  await dispatchIntake({
    subject: "Reset your CyberAutopsy password",
    bodyText: emailBody,
    replyTo: email
  }).catch(() => {
    /* email failure is non-fatal — link still works if user has it */
  });

  // For the demo user, expose the link directly so testers can complete the
  // flow without configuring email. Real users do NOT get the URL back.
  if (isDemoUser(email)) {
    return NextResponse.json({
      ok: true,
      demo: true,
      message:
        "Demo account — the reset link is displayed here so you can complete the flow without email setup.",
      resetUrl
    });
  }

  return NextResponse.json({
    ok: true,
    message:
      "If an account exists for that email, a password reset link has been sent. It expires in 15 minutes."
  });
}
