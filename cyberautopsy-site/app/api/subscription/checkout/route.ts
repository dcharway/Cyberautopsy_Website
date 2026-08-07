import { NextResponse } from "next/server";
import { getUser, upsertUser } from "@/lib/auth/store";
import { getPlan, priceIdFor } from "@/lib/subscription/plans";
import { getStripe, isStripeConfigured, marketingUrl } from "@/lib/subscription/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Create a Stripe Checkout Session for the caller's chosen plan and return
 * the hosted checkout URL. The client redirects to it — no card data touches
 * this server.
 *
 * Auth: the user must be logged in AND have a verified email. The session
 * cookie is validated by the same signSession/verifySession pair the portal
 * uses. Anonymous checkout is not supported; users register first.
 */
export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Payments are not yet configured on this deployment. Contact support to complete subscription setup."
      },
      { status: 503 }
    );
  }

  let body: { email?: string; plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  const planId = (body.plan ?? "").trim();

  if (!email || !planId) {
    return NextResponse.json({ error: "Email and plan are required." }, { status: 400 });
  }

  const user = await getUser(email);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "Verify your email before starting a subscription." },
      { status: 403 }
    );
  }

  const plan = getPlan(planId);
  if (!plan) return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  if (plan.ctaKind === "contact") {
    return NextResponse.json(
      { error: "This plan is sold via direct contact — not self-serve." },
      { status: 400 }
    );
  }

  const priceId = priceIdFor(plan);
  if (!priceId) {
    return NextResponse.json(
      {
        error: `The Stripe Price ID for ${plan.name} is not configured (${plan.priceEnvVar}). Contact support.`
      },
      { status: 503 }
    );
  }

  const stripe = getStripe()!;

  // Reuse the Stripe customer if we already created one for this user
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: {
        cyberEmail: user.email,
        cyberOrganization: user.organization ?? ""
      }
    });
    customerId = customer.id;
    user.stripeCustomerId = customerId;
    await upsertUser(user);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: marketingUrl("/portal/account?checkout=success&session_id={CHECKOUT_SESSION_ID}"),
    cancel_url: marketingUrl("/portal/plans?checkout=cancelled"),
    allow_promotion_codes: true,
    billing_address_collection: "required",
    client_reference_id: user.email,
    subscription_data: {
      metadata: {
        cyberEmail: user.email,
        cyberPlan: plan.id
      }
    },
    metadata: {
      cyberEmail: user.email,
      cyberPlan: plan.id
    }
  });

  return NextResponse.json({ url: session.url });
}
