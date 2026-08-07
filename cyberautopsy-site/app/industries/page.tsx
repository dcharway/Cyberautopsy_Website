import Link from "next/link";

export const metadata = {
  title: "Industries — Federal, Defense, Regulated, Commercial, and Technology",
  description:
    "Cybersecurity, GRC, cloud, and workforce services for federal agencies, defense contractors, healthcare and financial organizations, commercial businesses, and technology companies."
};

const sectors = [
  {
    code: "FED",
    name: "Federal Agencies",
    headline: "Mission support with cybersecurity engineered in.",
    body: "We support federal civilian and defense agencies with authorization work under FISMA and NIST 800-53, FedRAMP sponsorship and A&A support for cloud services, continuous monitoring programs, and mission-focused technology modernization.",
    typical: [
      "FISMA / NIST 800-53 authorization support",
      "FedRAMP program office and 3PAO coordination",
      "Continuous monitoring and control assessments",
      "Mission-focused data, cloud, and AI modernization"
    ]
  },
  {
    code: "DoD",
    name: "Defense Contractors",
    headline: "Primes, subs, and manufacturers handling FCI or CUI.",
    body: "From prime contractors coordinating supply-chain flow-down to sub-scale contractors receiving their first DFARS 7021 notice, we tailor CMMC readiness, documentation, and assessment support to the operating reality — including the manufacturing shop floor, ITAR-controlled drawings, and OT/IT convergence.",
    typical: [
      "CMMC readiness at Level 1, Level 2, or Level 3",
      "DFARS 7012 / 7019 / 7020 / 7021 compliance",
      "CUI enclave design (on-prem or GCC-High)",
      "Supplier flow-down programs for primes"
    ]
  },
  {
    code: "REG",
    name: "Regulated Organizations",
    headline: "Healthcare, financial services, energy, and critical infrastructure.",
    body: "Regulated industries carry overlapping obligations — HIPAA and HITRUST in healthcare; PCI DSS, SOX, and GLBA in finance; NERC CIP and TSA directives in energy; sector-specific rules elsewhere. We build integrated compliance programs that satisfy each obligation without duplicating the work.",
    typical: [
      "HIPAA / HITRUST security and privacy programs",
      "PCI DSS assessment support and remediation",
      "SOC 2 program stand-up and readiness",
      "Sector-specific critical infrastructure obligations"
    ]
  },
  {
    code: "COM",
    name: "Commercial Businesses",
    headline: "Growth-stage security programs that hold up under diligence.",
    body: "Commercial firms often confront cybersecurity when a customer requires it — a SOC 2 report, an ISO 27001 certificate, an enterprise-security questionnaire. We stand up right-sized programs that answer the question in front of you now and scale into the certifications that come next.",
    typical: [
      "SOC 2 Type I and Type II readiness + audit support",
      "ISO 27001 program design + certification support",
      "Vendor security questionnaire response programs",
      "Board-facing risk reporting and executive briefings"
    ]
  },
  {
    code: "TECH",
    name: "Technology Companies",
    headline: "Product security, cloud-native controls, and AI governance.",
    body: "SaaS and platform companies operate under a different threat surface — customer data, multi-tenant boundaries, third-party integrations, AI features under regulatory scrutiny. We help engineering-led firms bake security into the product lifecycle and prepare for the security-review process every enterprise customer runs.",
    typical: [
      "Product security engineering and secure SDLC",
      "Cloud-native security architecture (AWS / Azure / GCP)",
      "FedRAMP path for SaaS selling into government",
      "AI governance, model risk management, and privacy review"
    ]
  }
];

export default function Industries() {
  return (
    <>
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:px-10 lg:pt-32 lg:pb-28">
          <span className="classified-stamp">INDUSTRIES</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            One firm.{" "}
            <span className="gold-text">Five operating realities.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            The same 110-control catalog reads very differently at a $20M subcontractor and a
            civilian federal agency. We tailor the delivery pattern to your sector, your regulatory
            surface, and the maturity of the program you already have.
          </p>
        </div>
      </section>

      <section className="bg-ink-950 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-8">
          {sectors.map((s) => (
            <article
              key={s.code}
              className="grid gap-10 border border-ink-700 bg-ink-900 p-8 lg:grid-cols-[180px_1fr_320px] lg:p-12"
            >
              <div>
                <div className="font-mono text-[11px] tracking-widest2 text-gold-300">
                  SECTOR &middot; {s.code}
                </div>
                <h2 className="mt-3 font-serif text-3xl tracking-tightest text-bone-50">
                  {s.name}
                </h2>
              </div>
              <div>
                <h3 className="font-serif text-2xl text-bone-50">{s.headline}</h3>
                <p className="mt-4 text-bone-200 max-w-prose2">{s.body}</p>
              </div>
              <div className="border-t border-ink-700 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
                  Typical engagements
                </div>
                <ul className="mt-3 space-y-2 text-sm text-bone-200">
                  {s.typical.map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-2 inline-block h-1.5 w-1.5 rotate-45 bg-gold-300" aria-hidden />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink-900 py-24 border-t border-ink-700/60 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <span className="classified-stamp">NEXT STEP</span>
          <h2 className="mt-8 font-serif text-4xl tracking-tightest sm:text-5xl">
            Not sure which profile fits you?
          </h2>
          <p className="mt-5 text-bone-200">
            A 20-minute call with a partner scopes it in the room. Bring the compliance obligation
            you&rsquo;re working against, the environment you&rsquo;re protecting, and the outcome
            you need.
          </p>
          <Link href="/contact" className="mt-10 inline-block bg-gold-300 px-6 py-4 text-sm font-medium text-ink-950 hover:bg-gold-200">
            Request Consultation &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
