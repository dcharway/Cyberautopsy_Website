import Link from "next/link";
import { RiskCalculator } from "@/components/RiskCalculator";
import { LeadMagnetForm } from "@/components/LeadMagnetForm";

export const metadata = {
  title: "Resources — Guides, Calculators, and Self-Assessment for CMMC",
  description:
    "CMMC 2.0 vs 1.0 guide, DFARS 7012 checklist, SPRS score estimator, and the Will-I-Fail self-assessment. Written by former DoD assessors."
};

const guides = [
  {
    tag: "GUIDE",
    title: "CMMC 2.0 vs CMMC 1.0",
    body: "What collapsed from five levels to three, what survived, and what every contractor needs to internalize. The plain-English read.",
    href: "/resources/cmmc-2-vs-1"
  },
  {
    tag: "GUIDE",
    title: "DFARS 252.204-7012: The 14 Obligations",
    body: "Every obligation under DFARS 7012 — incident reporting, CUI safeguarding, flow-down — distilled into a one-page audit checklist.",
    href: "/resources/dfars-7012-obligations",
    id: "dfars-checklist"
  },
  {
    tag: "TOOL",
    title: "SPRS Score Estimator",
    body: "Ten questions. We compute the likely SPRS score range you would post today, and where the weight will deduct from.",
    href: "/resources/sprs-estimator",
    id: "sprs-calculator"
  },
  {
    tag: "ASSESSMENT",
    title: "Will I Fail? Self-Assessment",
    body: "A confidential 7-minute self-assessment that tells you which of the 14 families is most likely to drop your engagement.",
    href: "/resources/will-i-fail",
    id: "self-assessment"
  },
  {
    tag: "GUIDE",
    title: "Building a CUI Enclave",
    body: "GCC-High, hardened workstation, or full enclave? The architectural decision that defines your CMMC budget for three years.",
    href: "/resources/cui-enclave-architectures"
  },
  {
    tag: "GUIDE",
    title: "POA&M Mechanics",
    body: "Which controls are POA&M-eligible. What 180-day closure actually requires. How POA&Ms get a certificate revoked.",
    href: "/resources/poam-mechanics"
  }
];

export default function Resources() {
  return (
    <>
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:px-10 lg:pt-32 lg:pb-28">
          <span className="classified-stamp">RESOURCES</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            The library. <span className="gold-text">Plain English. No marketing.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            Every artifact here is written by a former assessor or CISO. We do not gate the
            substance. The truth about CMMC is freely available to anyone willing to read it.
          </p>
        </div>
      </section>

      <section className="bg-ink-950 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-2">
            {guides.map((g) => (
              <Link
                id={g.id}
                key={g.title}
                href={g.href}
                className="group block border border-ink-700 bg-ink-900 p-8 transition hover:border-gold-300/60"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-widest2 text-gold-300">{g.tag}</span>
                  <span className="font-mono text-[10px] tracking-widest2 text-bone-400 group-hover:text-gold-300">
                    READ &rarr;
                  </span>
                </div>
                <h2 className="mt-5 font-serif text-2xl text-bone-50 group-hover:text-gold-100">
                  {g.title}
                </h2>
                <p className="mt-3 text-sm text-bone-300">{g.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <RiskCalculator />

      {/* GATED LEAD MAGNET / EXIT INTENT */}
      <section className="border-y border-ink-700/60 bg-ink-900 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <span className="classified-stamp">CONFIDENTIAL BRIEF</span>
          <h2 className="mt-8 font-serif text-4xl tracking-tightest sm:text-5xl">
            The 5 Controls That Fail <span className="gold-text">80% of Contractors.</span>
          </h2>
          <p className="mt-6 text-bone-300 max-w-prose2 mx-auto">
            A six-page brief authored from inside dozens of C3PAO engagements. Gated behind a single
            email and CAGE code so we know which side of the supply chain we are speaking to.
          </p>

          <LeadMagnetForm />

          <p className="mt-4 text-[11px] text-bone-400">
            We do not sell or share your data. The brief is sent once, from a partner&rsquo;s address.
          </p>
        </div>
      </section>
    </>
  );
}
