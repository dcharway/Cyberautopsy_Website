import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/store";
import { entitlementsFor } from "@/lib/subscription/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Return the current subscription snapshot for the given email. Used by
 * the Account page to render "current plan / renewal date / status" without
 * duplicating store access on the client.
 *
 * This endpoint deliberately does not return password hashes or Stripe IDs
 * beyond what the UI needs.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const user = await getUser(email);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const entitlement = entitlementsFor(user);

  return NextResponse.json({
    email: user.email,
    name: user.name,
    organization: user.organization,
    emailVerified: user.emailVerified,
    role: user.role,
    plan: entitlement.plan
      ? { id: entitlement.plan.id, name: entitlement.plan.name }
      : user.plan
      ? { id: user.plan, name: user.plan }
      : null,
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd,
    cancelAtPeriodEnd: user.cancelAtPeriodEnd,
    hasPortalAccess: entitlement.hasPortalAccess,
    capabilities: entitlement.capabilities,
    entitlementReason: entitlement.reason,
    stripeCustomerId: user.stripeCustomerId
  });
}
