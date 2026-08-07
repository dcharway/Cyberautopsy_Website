import Link from "next/link";
import { PLANS, ALL_CAPABILITIES, type Plan, type Capability } from "@/lib/subscription/plans";

export const metadata = {
  title: "Subscription Plans — CyberAutopsy GRC",
  description:
    "Compare Starter, Professional, and Enterprise plans for the CyberAutopsy GRC platform. Transparent monthly pricing, cancel anytime, no card details stored on our servers."
};

const CAP_LABELS: Record<Capability, string> = {
  risk_assessments: "Cybersecurity risk assessments",
  grc_workflows: "GRC workflows",
  risk_registers: "Risk registers + risk modeling",
  control_mapping: "Security controls + framework mapping",
  policy_management: "Policy and procedure management",
  evidence_management: "Evidence and document management",
  compliance_tracking: "Compliance tracking",
  poam_management: "POA&M and remediation management",
  assessment_prep: "Pre-assessment readiness checklists",
  reporting: "Reporting + executive dashboards",
  multi_client: "Multi-client dashboards",
  custom_frameworks: "Custom control frameworks",
  api_access: "API access",
  priority_support: "Priority support"
};

function formatPrice(plan: Plan): string {
  return plan.monthlyPriceUSD === null ? "Custom" : `$${plan.monthlyPriceUSD.toLocaleString()}`;
}
function formatUnit(plan: Plan): string {
  return plan.monthlyPriceUSD === null ? "contact sales" : "USD / month";
}
function formatLimit(v: number | "unlimited"): string {
  return v === "unlimited" ? "Unlimited" : String(v);
}

export default function PlansPage() {
  return (
    <>
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 lg:px-10 lg:pt-32 lg:pb-24">
          <span className="classified-stamp">SUBSCRIPTION PLANS</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            Simple plans.{" "}
            <span className="gold-text">Everything you need. Nothing you don&rsquo;t.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            All plans include multi-factor authentication, encrypted data, unlimited framework
            support (NIST, CMMC, FedRAMP, ISO 27001, SOC 2, HIPAA, and custom), monthly billing,
            and cancellation from your account at any time. Card details are handled by Stripe —
            never stored on our servers.
          </p>
        </div>
      </section>

      {/* CARDS */}
      <section className="bg-ink-950 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={
                  plan.highlight
                    ? "flex flex-col border border-gold-300/60 bg-gold-300/5 p-8 shadow-gilt"
                    : "flex flex-col border border-ink-700 bg-ink-900 p-8"
                }
              >
                {plan.highlight && (
                  <span className="inline-block border border-gold-300/60 bg-gold-300/10 px-2 py-0.5 font-mono text-[9px] tracking-widest2 text-gold-200">
                    MOST POPULAR
                  </span>
                )}
                <h2 className="mt-3 font-serif text-3xl tracking-tightest text-bone-50">
                  {plan.name}
                </h2>
                <p className="mt-2 text-sm text-bone-400">{plan.tagline}</p>
                <div className="mt-6">
                  <span className="font-serif text-5xl text-bone-50">{formatPrice(plan)}</span>
                  <div className="mt-1 font-mono text-[11px] tracking-widest text-bone-400">
                    {formatUnit(plan)}
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-ink-700 py-4 text-center">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-bone-400">Clients</dt>
                    <dd className="mt-1 text-lg text-bone-100">{formatLimit(plan.limits.clients)}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-bone-400">Users</dt>
                    <dd className="mt-1 text-lg text-bone-100">{formatLimit(plan.limits.users)}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-bone-400">Assessments</dt>
                    <dd className="mt-1 text-lg text-bone-100">{formatLimit(plan.limits.assessmentsPerYear)}</dd>
                  </div>
                </dl>

                <ul className="mt-6 space-y-2 text-sm text-bone-200">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2 inline-block h-1.5 w-1.5 rotate-45 bg-gold-300 shrink-0"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-ink-700">
                  <Link
                    href={plan.ctaKind === "checkout" ? `/portal/signup?plan=${plan.id}` : "/contact"}
                    className={
                      plan.highlight
                        ? "inline-flex w-full items-center justify-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200"
                        : "inline-flex w-full items-center justify-center gap-2 border border-gold-300/40 bg-gold-300/5 px-5 py-3 text-sm text-gold-100 hover:bg-gold-300 hover:text-ink-950"
                    }
                  >
                    {plan.ctaLabel} &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX */}
      <section className="bg-ink-900 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="classified-stamp">FEATURE COMPARISON</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              Every capability, <span className="gold-text">side-by-side.</span>
            </h2>
          </div>
          <div className="mt-12 overflow-x-auto border border-ink-700 bg-ink-950">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-700 bg-ink-900">
                  <th className="px-5 py-4 font-mono text-[10px] uppercase tracking-widest text-bone-400">
                    Capability
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      className="px-5 py-4 text-center font-serif text-lg text-bone-50"
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_CAPABILITIES.map((cap) => (
                  <tr key={cap} className="border-b border-ink-700/60">
                    <td className="px-5 py-3 text-bone-100">{CAP_LABELS[cap]}</td>
                    {PLANS.map((p) => (
                      <td key={p.id} className="px-5 py-3 text-center">
                        {p.capabilities.includes(cap) ? (
                          <span className="text-status-met">&#10003;</span>
                        ) : (
                          <span className="text-bone-500">&mdash;</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-xs text-bone-400">
            Not seeing what you need?{" "}
            <Link href="/contact" className="text-gold-300 hover:text-gold-100 underline">
              Talk to us
            </Link>{" "}
            about a custom Enterprise scope.
          </p>
        </div>
      </section>
    </>
  );
}
