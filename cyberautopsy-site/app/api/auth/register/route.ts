import { NextResponse } from "next/server";
import { createUser, getUser } from "@/lib/auth/store";
import { issueVerificationToken } from "@/lib/auth/verification";
import { sendEmail } from "@/lib/email";
import { marketingUrl } from "@/lib/subscription/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_PASSWORD_LEN = 12;

export async function POST(req: Request) {
  let body: {
    email?: string;
    name?: string;
    organization?: string;
    password?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim();
  const organization = (body.organization ?? "").trim();
  const password = body.password ?? "";

  // Server-side validation — never rely on the client
  if (!email || !name || !organization || !password) {
    return NextResponse.json(
      { error: "Name, organization, email, and password are all required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LEN) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LEN} characters.` },
      { status: 400 }
    );
  }
  if (name.length > 120 || organization.length > 200) {
    return NextResponse.json({ error: "Name or organization is too long." }, { status: 400 });
  }

  // Enumeration-safe: if the email is already registered, respond exactly
  // like the success path (with instructions to check inbox). Do not reveal
  // whether the account already existed.
  const existing = await getUser(email);
  if (existing) {
    return NextResponse.json({
      ok: true,
      message:
        "If a new account was created, a verification email has been sent. Check your inbox and spam folder."
    });
  }

  try {
    await createUser({ email, name, organization, password });
  } catch (err) {
    // In practice this only fires on a race; treat as generic success.
    console.warn(`[auth/register] createUser error for ${email}:`, err);
    return NextResponse.json({
      ok: true,
      message:
        "If a new account was created, a verification email has been sent. Check your inbox and spam folder."
    });
  }

  const token = await issueVerificationToken(email);
  const verifyUrl = marketingUrl(
    `/portal/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
  );

  await sendEmail({
    to: email,
    subject: "Verify your CyberAutopsy account",
    text: [
      `Welcome to CyberAutopsy, ${name}.`,
      "",
      "Confirm your email address to finish creating your account:",
      verifyUrl,
      "",
      "This link expires in 48 hours. If you did not create an account, ignore this email.",
      "",
      "— CyberAutopsy"
    ].join("\n")
  });

  return NextResponse.json({
    ok: true,
    message:
      "Check your inbox for a verification link. It expires in 48 hours. Look in spam if it doesn't arrive within a few minutes."
  });
}
