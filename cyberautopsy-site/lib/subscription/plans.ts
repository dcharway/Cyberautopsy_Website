/**
 * Subscription plan catalog.
 *
 * These are the plans surfaced on /portal and /portal/plans. Each plan lists
 * its Stripe Price ID via env vars — the actual products / prices are created
 * in the Stripe dashboard (once) and their IDs are pasted into .env.local on
 * the VPS. That keeps price changes out of the codebase.
 *
 * Adding / renaming plans is a code change (edit this file). Repricing an
 * existing plan is an env change (create a new Price in Stripe, update the
 * env var, redeploy).
 */

export type PlanTier = "starter" | "professional" | "enterprise";
export type Capability =
  | "risk_assessments"
  | "grc_workflows"
  | "risk_registers"
  | "control_mapping"
  | "policy_management"
  | "evidence_management"
  | "compliance_tracking"
  | "poam_management"
  | "assessment_prep"
  | "reporting"
  | "multi_client"
  | "custom_frameworks"
  | "api_access"
  | "priority_support";

export type Plan = {
  id: PlanTier;
  name: string;
  tagline: string;
  monthlyPriceUSD: number | null;        // null = custom pricing (contact sales)
  billingFrequency: "monthly" | "annual" | "custom";
  priceEnvVar: string;                    // env var holding the Stripe Price ID
  ctaLabel: string;
  ctaKind: "checkout" | "contact";
  limits: {
    clients: number | "unlimited";
    users: number | "unlimited";
    assessmentsPerYear: number | "unlimited";
  };
  features: string[];
  capabilities: Capability[];
  highlight?: boolean;                    // gold-frame highlight on the plan grid
};

/**
 * Full capability set — every entitlement the GRC platform gates on.
 * Keep this in sync with the portal's permission checks.
 */
export const ALL_CAPABILITIES: Capability[] = [
  "risk_assessments",
  "grc_workflows",
  "risk_registers",
  "control_mapping",
  "policy_management",
  "evidence_management",
  "compliance_tracking",
  "poam_management",
  "assessment_prep",
  "reporting",
  "multi_client",
  "custom_frameworks",
  "api_access",
  "priority_support"
];

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline:
      "For a single organization standing up its first cybersecurity governance program.",
    monthlyPriceUSD: 299,
    billingFrequency: "monthly",
    priceEnvVar: "STRIPE_PRICE_STARTER",
    ctaLabel: "Start subscription",
    ctaKind: "checkout",
    limits: { clients: 1, users: 5, assessmentsPerYear: 4 },
    features: [
      "1 client organization",
      "Up to 5 named users",
      "Cybersecurity risk assessments",
      "Risk register + risk modeling",
      "Security control mapping",
      "POA&M and remediation tracking",
      "Policy and procedure management",
      "Standard reporting dashboards",
      "Framework support: NIST 800-171, CMMC L1 / L2, SOC 2, HIPAA",
      "Email support"
    ],
    capabilities: [
      "risk_assessments",
      "grc_workflows",
      "risk_registers",
      "control_mapping",
      "policy_management",
      "evidence_management",
      "compliance_tracking",
      "poam_management",
      "reporting"
    ]
  },
  {
    id: "professional",
    name: "Professional",
    tagline:
      "For consultancies, MSSPs, and multi-entity organizations managing several assessments in parallel.",
    monthlyPriceUSD: 799,
    billingFrequency: "monthly",
    priceEnvVar: "STRIPE_PRICE_PROFESSIONAL",
    ctaLabel: "Start subscription",
    ctaKind: "checkout",
    highlight: true,
    limits: { clients: 5, users: 25, assessmentsPerYear: "unlimited" },
    features: [
      "Up to 5 client organizations",
      "Up to 25 named users",
      "Everything in Starter, plus:",
      "Multi-client dashboards and switching",
      "Assessment preparation workflows",
      "Executive briefing & board-ready PDF exports",
      "C3PAO assessment packet generation",
      "Custom control frameworks",
      "Framework support: all of Starter + FedRAMP, FISMA, NIST 800-53, ISO 27001, Zero Trust",
      "Priority email + chat support"
    ],
    capabilities: [
      "risk_assessments",
      "grc_workflows",
      "risk_registers",
      "control_mapping",
      "policy_management",
      "evidence_management",
      "compliance_tracking",
      "poam_management",
      "assessment_prep",
      "reporting",
      "multi_client",
      "custom_frameworks",
      "priority_support"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline:
      "For federal agencies, primes, and enterprises requiring dedicated support, custom SLAs, and API-level integration.",
    monthlyPriceUSD: null, // custom
    billingFrequency: "custom",
    priceEnvVar: "STRIPE_PRICE_ENTERPRISE", // Optional — Enterprise defaults to sales-contact flow
    ctaLabel: "Request a proposal",
    ctaKind: "contact",
    limits: { clients: "unlimited", users: "unlimited", assessmentsPerYear: "unlimited" },
    features: [
      "Unlimited client organizations",
      "Unlimited users with SSO",
      "Everything in Professional, plus:",
      "Dedicated Compliance Surgeon on retainer",
      "Custom framework onboarding",
      "API access for integrations (SIEM / ticketing / IAM)",
      "Custom SLA and named support contact",
      "Onboarding and quarterly business reviews",
      "Optional on-premise or FedRAMP Moderate deployment"
    ],
    capabilities: ALL_CAPABILITIES
  }
];

/** Look up a plan by id. Returns null if the id is unknown. */
export function getPlan(id: string | null | undefined): Plan | null {
  if (!id) return null;
  return PLANS.find((p) => p.id === id) ?? null;
}

/** Resolve the Stripe Price ID for a plan from env vars at runtime. */
export function priceIdFor(plan: Plan): string | null {
  const id = process.env[plan.priceEnvVar];
  return id && id.startsWith("price_") ? id : null;
}
