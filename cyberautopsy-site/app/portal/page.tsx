import Link from "next/link";
import {
  ShieldCheck,
  Layers,
  ClipboardCheck,
  BarChart3,
  Users,
  FileText,
  LogIn,
  UserPlus,
  MessageSquare
} from "lucide-react";
import { PLANS } from "@/lib/subscription/plans";

export const metadata = {
  title: "Client Portal — CyberAutopsy GRC Platform",
  description:
    "Subscribe to the CyberAutopsy governance, risk, and compliance platform. Risk assessments, control mapping, POA&M tracking, evidence management, executive reporting — for federal, defense, regulated, and commercial organizations."
};

const benefits = [
  {
    icon: ShieldCheck,
    title: "Risk-based cybersecurity, not checklist compliance",
    body: "Model risks quantitatively, map them to the controls that actually reduce them, and track posture continuously — not just at audit time."
  },
  {
    icon: Layers,
    title: "Every major framework in one workspace",
    body: "NIST 800-53, NIST 800-171, CMMC (all levels), FedRAMP, FISMA, ISO 27001, SOC 2, HIPAA, and custom frameworks. Cross-mapped so a single control satisfies multiple standards."
  },
  {
    icon: ClipboardCheck,
    title: "Assessment-ready evidence",
    body: "Evidence libraries indexed the way an assessor reads them. Generate C3PAO packets, executive briefs, and audit-day workbooks in one click."
  },
  {
    icon: BarChart3,
    title: "Executive dashboards + board-ready PDFs",
    body: "One-page executive briefs, SPRS scoring, top-five-risk views, and readiness dashboards suitable for board and leadership review."
  },
  {
    icon: Users,
    title: "Multi-client, role-based",
    body: "Consultancies and MSSPs manage several client engagements from one login. Least-privilege permissions gate every feature by role."
  },
  {
    icon: FileText,
    title: "POA&M and remediation tracking",
    body: "Weakness → remediation plan → owner → due date → closure evidence, with an auditable history trail on every change."
  }
];

const grcFeatures = [
  "Cybersecurity risk assessments",
  "Governance, Risk, and Compliance workflows",
  "Risk registers and risk modeling",
  "Security controls and framework mapping",
  "Policy and procedure management",
  "Evidence and document management",
  "Compliance tracking",
  "POA&M and remediation management",
  "Pre-assessment readiness checklists",
  "Reporting and compliance dashboards"
];

function formatPrice(plan: (typeof PLANS)[number]): string {
  if (plan.monthlyPriceUSD === null) return "Custom";
  return `$${plan.monthlyPriceUSD.toLocaleString()}/mo`;
}

export default function PortalLanding() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950 via-ink-950 to-ink-900" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 lg:px-10 lg:pt-32 lg:pb-24">
          <span className="classified-stamp">CLIENT PORTAL · CYBERAUTOPSY GRC</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            Cybersecurity governance,{" "}
            <span className="gold-text">on your terms.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            A subscription-based GRC workspace for federal, defense, regulated, and commercial
            organizations. Risk assessments, control mapping, evidence management, POA&amp;M
            tracking, and executive reporting — across every major cybersecurity framework, CMMC
            included as one of many.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/portal/signup"
              className="inline-flex items-center gap-2 bg-gold-300 px-6 py-4 text-sm font-medium tracking-wide text-ink-950 transition hover:bg-gold-200"
            >
              <UserPlus size={14} />
              Create Your Account
            </Link>
            <Link
              href="/portal/plans"
              className="inline-flex items-center gap-2 border border-gold-300/50 bg-gold-300/5 px-6 py-4 text-sm font-medium text-gold-100 transition hover:bg-gold-300 hover:text-ink-950"
            >
              View Subscription Plans
            </Link>
            <Link
              href="/portal/signin"
              className="inline-flex items-center gap-2 border border-bone-300/30 px-6 py-4 text-sm font-medium text-bone-100 transition hover:border-gold-300 hover:text-gold-300"
            >
              <LogIn size={14} /> Sign In
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-ink-700 bg-ink-900 px-6 py-4 text-sm text-bone-200 transition hover:border-gold-300/60 hover:text-gold-200"
            >
              <MessageSquare size={14} /> Request a Demonstration
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-b border-ink-700/60 bg-ink-900 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="classified-stamp">WHY CYBERAUTOPSY GRC</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              Built for how assessors actually{" "}
              <span className="gold-text">read the evidence.</span>
            </h2>
            <p className="mt-6 text-bone-200">
              The platform was designed by former DoD assessors and defense-industry CISOs. Every
              screen answers a question a real auditor asks — starting with &ldquo;show me the
              artifact.&rdquo;
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <article
                  key={b.title}
                  className="border border-ink-700 bg-ink-950 p-6 transition hover:border-gold-300/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center border border-gold-300/50 bg-gold-300/5 text-gold-300">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 font-serif text-xl text-bone-50">{b.title}</h3>
                  <p className="mt-3 text-sm text-bone-300">{b.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CAPABILITIES / GRC feature list */}
      <section className="border-b border-ink-700/60 bg-ink-950 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <span className="classified-stamp">WHAT'S INSIDE</span>
              <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
                A working <span className="gold-text">GRC platform.</span>
              </h2>
              <p className="mt-6 text-bone-300 max-w-prose2">
                Not a spreadsheet library. Not a form-fill tool. A full workspace for the day-to-day
                work of running a cybersecurity governance program.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {grcFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 border border-ink-700 bg-ink-900 p-4">
                  <span
                    aria-hidden
                    className="mt-1.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold-300 shrink-0"
                  />
                  <span className="text-sm text-bone-100">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="border-b border-ink-700/60 bg-ink-900 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="classified-stamp">SUBSCRIPTION PLANS</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              Simple, transparent pricing.{" "}
              <span className="gold-text">Cancel anytime.</span>
            </h2>
            <p className="mt-6 text-bone-200">
              Every plan is billed monthly and can be upgraded, downgraded, or cancelled from your
              account at any time. Payments processed securely through Stripe — we never store card
              details on our servers.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={
                  plan.highlight
                    ? "flex flex-col border border-gold-300/60 bg-gold-300/5 p-8 shadow-gilt"
                    : "flex flex-col border border-ink-700 bg-ink-950 p-8"
                }
              >
                <header>
                  {plan.highlight && (
                    <span className="inline-block border border-gold-300/60 bg-gold-300/10 px-2 py-0.5 font-mono text-[9px] tracking-widest2 text-gold-200">
                      MOST POPULAR
                    </span>
                  )}
                  <h3 className="mt-3 font-serif text-3xl tracking-tightest text-bone-50">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-bone-400">{plan.tagline}</p>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="font-serif text-4xl text-bone-50">{formatPrice(plan)}</span>
                    {plan.monthlyPriceUSD !== null && (
                      <span className="font-mono text-[11px] tracking-widest text-bone-400">
                        USD · monthly billing
                      </span>
                    )}
                  </div>
                </header>

                <ul className="mt-8 space-y-2 text-sm text-bone-200">
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

          <p className="mt-8 text-center text-xs text-bone-400">
            Not sure which plan fits?{" "}
            <Link href="/contact" className="text-gold-300 hover:text-gold-100 underline underline-offset-4">
              Request a demonstration
            </Link>{" "}
            and we&rsquo;ll walk you through the workspace live.
          </p>
        </div>
      </section>

      {/* SECURITY + TRUST */}
      <section className="border-b border-ink-700/60 bg-ink-950 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="classified-stamp">SECURITY &amp; PRIVACY</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              Built to the standard{" "}
              <span className="gold-text">we ask you to build to.</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TrustCard k="MFA" v="TOTP-based multi-factor authentication on every account" />
            <TrustCard k="Sessions" v="Signed HMAC-SHA256 tokens · short TTL · secure cookies" />
            <TrustCard k="Passwords" v="scrypt hashing · never stored in plaintext" />
            <TrustCard k="Payments" v="Stripe-hosted checkout · card data never touches our servers" />
            <TrustCard k="RBAC" v="Role- and plan-based least-privilege permissions" />
            <TrustCard k="Data" v="Per-client isolation · exportable on request · deletable on cancellation" />
            <TrustCard k="Audit" v="Full audit trail on POA&M edits and account changes" />
            <TrustCard k="Compliance" v="Practices aligned to NIST 800-53 / 800-171 controls" />
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="bg-ink-900 py-24">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-10">
          <span className="classified-stamp">READY TO START</span>
          <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
            Create your account. <span className="gold-text">Pick a plan.</span> Get to work.
          </h2>
          <p className="mt-5 text-bone-300 max-w-2xl mx-auto">
            Registration takes under a minute. Email verification arrives immediately. Payment is
            handled by Stripe. Access activates the moment your first invoice clears.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/portal/signup"
              className="inline-flex items-center gap-2 bg-gold-300 px-6 py-4 text-sm font-medium text-ink-950 hover:bg-gold-200"
            >
              Create Your Account &rarr;
            </Link>
            <Link
              href="/portal/signin"
              className="inline-flex items-center gap-2 border border-bone-300/30 px-6 py-4 text-sm text-bone-100 hover:border-gold-300 hover:text-gold-300"
            >
              I already have an account &rarr;
            </Link>
          </div>
          <p className="mt-6 text-[11px] font-mono tracking-widest text-bone-400">
            BY CREATING AN ACCOUNT YOU AGREE TO OUR{" "}
            <Link href="/legal/terms" className="text-gold-300 hover:text-gold-100">TERMS</Link>,{" "}
            <Link href="/legal/privacy" className="text-gold-300 hover:text-gold-100">PRIVACY POLICY</Link>, AND{" "}
            <Link href="/legal/subscription" className="text-gold-300 hover:text-gold-100">SUBSCRIPTION TERMS</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

function TrustCard({ k, v }: { k: string; v: string }) {
  return (
    <div className="border border-ink-700 bg-ink-900 p-5">
      <div className="font-mono text-[11px] tracking-widest2 text-gold-300">{k}</div>
      <div className="mt-2 text-sm text-bone-100">{v}</div>
    </div>
  );
}
