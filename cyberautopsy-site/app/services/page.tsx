import Link from "next/link";

export const metadata = {
  title: "Services — Four Engagement Tiers, One Outcome",
  description:
    "Gap Assessment, Remediation Surge, Audit Escort, and Annual Retainer. Each tier is fixed-scope, fixed-deliverable, and ends in audit-ready posture."
};

const tiers = [
  {
    code: "I",
    name: "Gap Assessment",
    duration: "2-week sprint",
    price: "Fixed engagement fee",
    headline: "Find every gap. Score every control. Submit to SPRS.",
    body: "A two-week clinical sweep against the 110 controls of NIST SP 800-171. We map your CUI boundary, score every control to NIST 800-171A determination statements, and produce the three foundational artifacts.",
    deliverables: [
      "Authorization Boundary Memo, signed",
      "System Security Plan (SSP) v1",
      "Plan of Action & Milestones (POA&M)",
      "SPRS score, calculated and submission-ready",
      "Executive briefing to CEO/Board"
    ],
    bestFor:
      "Contractors who have not yet submitted an SPRS score, or who suspect the existing score is inflated."
  },
  {
    code: "II",
    name: "Remediation Surge",
    duration: "90-day sprint",
    price: "Scope-based",
    headline: "We fix it. With your team, on your stack, in 90 days.",
    body: "A surge engagement that takes a Gap Assessment from documented to implemented. Our compliance surgeons work alongside your IT and security staff to close controls in weekly war rooms. We do not deliver a backlog — we deliver Implemented status, with artifacts.",
    deliverables: [
      "Weekly war rooms with your IT, GRC, and engineering leads",
      "Implemented status across the 110 controls",
      "Evidence Library indexed for C3PAO consumption",
      "Re-scored SPRS submission",
      "POA&M closure tracking against the 180-day clock"
    ],
    bestFor:
      "Contractors who have a Gap Assessment and an award deadline they cannot miss. The most common engagement type."
  },
  {
    code: "III",
    name: "Audit Escort",
    duration: "Audit window",
    price: "Per-engagement",
    headline: "We sit beside you for the C3PAO assessment.",
    body: "A partner-led engagement during your formal C3PAO assessment. Findings get answered in the room with documentation already drafted. The assessor reads the packet you handed them, not a packet they had to assemble from your inbox.",
    deliverables: [
      "Pre-audit Assessment Packet review",
      "Live evidence defense across audit days",
      "Real-time clarification memos to the assessment team",
      "Post-audit close-out with finding remediation",
      "Certification handoff"
    ],
    bestFor:
      "Contractors whose audit is scheduled and whose internal team has not been through a C3PAO engagement before."
  },
  {
    code: "IV",
    name: "Annual Retainer",
    duration: "Ongoing",
    price: "Annual",
    headline: "The certificate is not the end. It is the moment the clock resets.",
    body: "Continuous monitoring of control posture, configuration drift detection, annual senior official affirmation, and quarterly evidence refresh. Your SPRS score stays current because someone is watching it weekly, not annually.",
    deliverables: [
      "Quarterly control re-test against NIST 800-171A",
      "Configuration drift monitoring on critical systems",
      "Annual senior official affirmation support",
      "POA&M closure governance",
      "C-suite briefings, twice yearly"
    ],
    bestFor:
      "Certified contractors who are operating under a recertification clock and cannot afford drift."
  }
];

export default function Services() {
  return (
    <>
      {/* HERO */}
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:px-10 lg:pt-32 lg:pb-28">
          <span className="classified-stamp">SERVICES</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            Four engagement tiers.{" "}
            <span className="gold-text">One outcome: certified.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            Every engagement is fixed-scope and ends in an artifact you can hand directly to a
            C3PAO. We do not bill by the hour or by the seat. We bill against deliverables that
            survive audit.
          </p>
        </div>
      </section>

      {/* TIERS */}
      <section className="bg-ink-950 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-8">
          {tiers.map((t) => (
            <article
              key={t.code}
              className="grid gap-10 border border-ink-700 bg-ink-900 p-8 lg:grid-cols-[200px_1fr_320px] lg:p-12"
            >
              <div>
                <div className="font-mono text-[11px] tracking-widest2 text-gold-300">TIER {t.code}</div>
                <h2 className="mt-3 font-serif text-3xl tracking-tightest text-bone-50">{t.name}</h2>
                <div className="mt-3 font-mono text-[11px] tracking-widest2 text-bone-400">
                  {t.duration}
                </div>
                <div className="mt-1 font-mono text-[11px] tracking-widest2 text-bone-400">{t.price}</div>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-bone-50">{t.headline}</h3>
                <p className="mt-4 text-bone-200 max-w-prose2">{t.body}</p>
                <div className="mt-5 border-l border-gold-300/40 pl-4 text-sm text-bone-300">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
                    Best for
                  </span>
                  <p className="mt-1">{t.bestFor}</p>
                </div>
              </div>

              <div className="border-t border-ink-700 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
                  Deliverables
                </div>
                <ul className="mt-3 space-y-2 text-sm text-bone-200">
                  {t.deliverables.map((d) => (
                    <li key={d} className="flex gap-3">
                      <span aria-hidden className="mt-2 inline-block h-1.5 w-1.5 rotate-45 bg-gold-300" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 border border-gold-300/40 bg-gold-300/5 px-4 py-2.5 text-sm text-gold-100 hover:bg-gold-300 hover:text-ink-950"
                >
                  Engage on Tier {t.code} &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="border-y border-ink-700/60 bg-ink-900 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <span className="classified-stamp">THE GUARANTEE</span>
          <h2 className="mt-8 font-serif text-4xl tracking-tightest sm:text-5xl">
            Certified, or <span className="gold-text">we don&rsquo;t stop.</span>
          </h2>
          <p className="mt-6 text-bone-200 max-w-prose2 mx-auto">
            If you engage CyberAutopsy on Gap Assessment plus Remediation Surge and fail your C3PAO
            assessment, we work the finding to closure at no additional fee. The terms are explicit
            in the engagement letter. We say it in writing because we have built our practice to
            never invoke it.
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center gap-2 bg-gold-300 px-6 py-4 text-sm font-medium text-ink-950 hover:bg-gold-200"
          >
            Book a Contract Risk Audit &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
