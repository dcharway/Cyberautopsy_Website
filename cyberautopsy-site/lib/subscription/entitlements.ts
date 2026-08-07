/**
 * Entitlement resolver — takes a User and returns the set of capabilities
 * they are currently allowed to exercise in the portal.
 *
 * Logic:
 *   1. Admins always get every capability (they own the platform).
 *   2. Demo accounts get a read-only subset for showcasing.
 *   3. Everyone else is gated by (a) verified email + (b) active subscription.
 *      The capability set for an active subscriber is the union declared by
 *      their plan in lib/subscription/plans.ts.
 *   4. `past_due` and `canceled` (but not yet period-end) still count as
 *      entitled — Stripe treats them as active until unpaid / expired.
 */

import type { User } from "@/lib/auth/store";
import { getPlan, ALL_CAPABILITIES, type Capability, type Plan } from "./plans";

const DEMO_CAPABILITIES: Capability[] = [
  "risk_assessments",
  "grc_workflows",
  "risk_registers",
  "reporting"
];

const ENTITLED_STATUSES = new Set(["active", "trialing", "past_due", "canceled"]);

export type Entitlement = {
  hasPortalAccess: boolean;         // any read/write into the GRC tool
  capabilities: Capability[];
  plan: Plan | null;
  reason: "admin" | "demo" | "subscribed" | "no-subscription" | "email-unverified" | "expired";
};

export function entitlementsFor(user: User): Entitlement {
  if (user.role === "admin") {
    return {
      hasPortalAccess: true,
      capabilities: ALL_CAPABILITIES,
      plan: null,
      reason: "admin"
    };
  }
  if (user.role === "demo") {
    return {
      hasPortalAccess: true,
      capabilities: DEMO_CAPABILITIES,
      plan: null,
      reason: "demo"
    };
  }
  if (!user.emailVerified) {
    return {
      hasPortalAccess: false,
      capabilities: [],
      plan: null,
      reason: "email-unverified"
    };
  }
  const plan = getPlan(user.plan);
  if (!plan || user.subscriptionStatus === "none") {
    return {
      hasPortalAccess: false,
      capabilities: [],
      plan: null,
      reason: "no-subscription"
    };
  }
  if (!ENTITLED_STATUSES.has(user.subscriptionStatus)) {
    return {
      hasPortalAccess: false,
      capabilities: [],
      plan,
      reason: "expired"
    };
  }
  return {
    hasPortalAccess: true,
    capabilities: plan.capabilities,
    plan,
    reason: "subscribed"
  };
}

export function can(entitlement: Entitlement, capability: Capability): boolean {
  return entitlement.hasPortalAccess && entitlement.capabilities.includes(capability);
}
