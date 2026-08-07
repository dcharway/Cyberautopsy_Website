import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/store";
import { getStripe, isStripeConfigured, marketingUrl } from "@/lib/subscription/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Create a Stripe Billing Portal session so the user can update payment
 * methods, view invoices, download receipts, and cancel their subscription
 * — all inside Stripe's hosted UI. No card data touches this server.
 */
export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Payments are not configured on this deployment." }, { status: 503 });
  }
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const user = await getUser(email);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (!user.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account exists for this user yet — start a subscription first." },
      { status: 400 }
    );
  }

  const stripe = getStripe()!;
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: marketingUrl("/portal/account")
  });
  return NextResponse.json({ url: session.url });
}
