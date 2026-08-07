import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/subscription/stripe";
import { getUserByStripeCustomerId, upsertUser, getUser } from "@/lib/auth/store";
import type { SubscriptionStatus } from "@/lib/auth/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook handler.
 *
 * Subscribed events (configure in Stripe dashboard → Developers → Webhooks):
 *   - checkout.session.completed             — first successful payment
 *   - customer.subscription.created
 *   - customer.subscription.updated          — includes cancel_at_period_end toggles
 *   - customer.subscription.deleted          — final expiry
 *   - invoice.payment_succeeded              — renewal
 *   - invoice.payment_failed                 — dunning entered
 *
 * The webhook secret (STRIPE_WEBHOOK_SECRET) is issued by Stripe when the
 * endpoint is registered. Every request is HMAC-verified before we mutate a
 * single user record — no verification, no state change.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !whSecret) {
    console.warn("[stripe/webhook] Stripe not configured — rejecting webhook");
    return NextResponse.json({ error: "Webhook receiver not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });

  // Raw body required for HMAC verification
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[stripe/webhook] Signature verification failed: ${msg}`);
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session, stripe);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await onSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await onSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_succeeded":
        await onInvoiceSucceeded(event.data.object as Stripe.Invoice, stripe);
        break;
      case "invoice.payment_failed":
        await onInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        // Silently 200 unknown events so Stripe stops retrying them.
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] Handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

/* ---------- handlers ---------- */

function mapStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  const known: Record<string, SubscriptionStatus> = {
    incomplete: "incomplete",
    incomplete_expired: "expired",
    trialing: "trialing",
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "unpaid",
    paused: "canceled"
  };
  return known[s] ?? "none";
}

function planIdFromSubscription(sub: Stripe.Subscription): string | null {
  const meta = sub.metadata?.cyberPlan;
  if (meta) return meta;
  // Fallback: match by price id against env vars
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) return null;
  const map: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER || ""]: "starter",
    [process.env.STRIPE_PRICE_PROFESSIONAL || ""]: "professional",
    [process.env.STRIPE_PRICE_ENTERPRISE || ""]: "enterprise"
  };
  return map[priceId] ?? null;
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe): Promise<void> {
  const email = (session.customer_email || session.client_reference_id || "").toLowerCase();
  if (!email) return;
  const user = await getUser(email);
  if (!user) return;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  if (customerId) user.stripeCustomerId = customerId;
  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id ?? null;
  if (subscriptionId) {
    user.stripeSubscriptionId = subscriptionId;
    // Pull the full subscription to backfill status + period end + plan
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    user.subscriptionStatus = mapStatus(sub.status);
    user.currentPeriodEnd = new Date(
    ((sub as unknown as { current_period_end: number }).current_period_end) * 1000
  ).toISOString();
    user.cancelAtPeriodEnd = Boolean(sub.cancel_at_period_end);
    user.plan = planIdFromSubscription(sub) ?? user.plan;
  }
  await upsertUser(user);
  console.info(`[stripe/webhook] Checkout completed for ${email} → plan ${user.plan} / ${user.subscriptionStatus}`);
}

async function onSubscriptionChange(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;
  user.stripeSubscriptionId = sub.id;
  user.subscriptionStatus = mapStatus(sub.status);
  user.currentPeriodEnd = new Date(
    ((sub as unknown as { current_period_end: number }).current_period_end) * 1000
  ).toISOString();
  user.cancelAtPeriodEnd = Boolean(sub.cancel_at_period_end);
  const planId = planIdFromSubscription(sub);
  if (planId) user.plan = planId;
  await upsertUser(user);
  console.info(`[stripe/webhook] Subscription updated for ${user.email} → plan ${user.plan} / ${user.subscriptionStatus}`);
}

async function onSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;
  user.subscriptionStatus = "expired";
  user.cancelAtPeriodEnd = false;
  // Keep stripeSubscriptionId + plan for audit history
  await upsertUser(user);
  console.info(`[stripe/webhook] Subscription expired for ${user.email}`);
}

async function onInvoiceSucceeded(inv: Stripe.Invoice, stripe: Stripe): Promise<void> {
  const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
  if (!customerId) return;
  const user = await getUserByStripeCustomerId(customerId);
  // Newer Stripe SDKs relocate subscription off the top-level Invoice; keep
  // this resilient across shapes.
  const invBag = inv as unknown as { subscription?: string | { id: string } | null };
  const subRef = invBag.subscription;
  if (!user || !subRef) return;
  const subId = typeof subRef === "string" ? subRef : subRef.id;
  const sub = await stripe.subscriptions.retrieve(subId);
  user.subscriptionStatus = mapStatus(sub.status);
  user.currentPeriodEnd = new Date(
    ((sub as unknown as { current_period_end: number }).current_period_end) * 1000
  ).toISOString();
  await upsertUser(user);
  console.info(`[stripe/webhook] Invoice paid for ${user.email} — next period ${user.currentPeriodEnd}`);
}

async function onInvoiceFailed(inv: Stripe.Invoice): Promise<void> {
  const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
  if (!customerId) return;
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;
  user.subscriptionStatus = "past_due";
  await upsertUser(user);
  console.warn(`[stripe/webhook] Invoice payment failed for ${user.email} — status past_due`);
}
