import Link from "next/link";

export const metadata = {
  title: "Industries — Primes, Subcontractors, Manufacturers, SaaS, Universities",
  description:
    "Engagements tailored to where CUI lives. Prime contractors, subcontractors, defense manufacturers, SaaS providers in the DoD supply chain, and research universities."
};

const sectors = [
  {
    code: "PRI",
    name: "Prime Contractors",
    headline: "You set the flow-down standard. Mistakes are visible.",
    body: "Primes are now answerable to contracting officers for the CMMC posture of their subcontractor base. The CUI boundary you defend is no longer just your own. We help primes build supplier intake programs that surface SPRS scores, draft compliant teaming agreement language, and rehearse the C3PAO posture across the supply chain.",
    typical: [
      "$500M to $5B+ annual DoD revenue",
      "10 to 200 subcontractors with CUI flow-down",
      "CISO + Contracts + Supply Chain stakeholder triangle"
    ]
  },
  {
    code: "SUB",
    name: "Subcontractors",
    headline: "The 7021 clause just landed in your inbox.",
    body: "Most subcontractors discover CMMC the day a prime sends them a flow-down notice. The 14 families do not get easier because you are smaller; in practice, they get harder because the assumed infrastructure is not present. We collapse the program down to the minimum viable enclave for sub-scale teams, often using a dedicated GCC-High tenant or a hardened workstation pattern.",
    typical: [
      "$1M to $50M annual revenue",
      "Single contracting officer, often single prime",
      "IT often outsourced; CISO function distributed"
    ]
  },
  {
    code: "MFG",
    name: "Defense Manufacturers",
    headline: "Your shop floor is in scope. Most are.",
    body: "Manufacturers are the highest-risk industry profile under CMMC because operational technology, contract drawings, and CAD files routinely qualify as CUI. We design enclaves that protect engineering data without halting production. CNC programming, ERP integration, and vendor portals all get scoped carefully.",
    typical: [
      "ITAR-controlled drawings and technical data",
      "OT/IT convergence challenges",
      "Multi-site operations with varied IT maturity"
    ]
  },
  {
    code: "SAAS",
    name: "SaaS Providers in the DoD Supply Chain",
    headline: "You are an External Service Provider. The rules are different.",
    body: "SaaS firms whose products store, process, or transmit CUI for DoD customers are External Service Providers under the rules. Your customers will require evidence of your security posture, often demanding FedRAMP Moderate equivalency or higher. We position SaaS providers for both the CMMC ESP role and the underlying FedRAMP path where required.",
    typical: [
      "FedRAMP Moderate or High equivalency required",
      "Multi-tenant boundary justification needed",
      "Continuous monitoring and POA&M discipline expected"
    ]
  },
  {
    code: "EDU",
    name: "Universities with CUI",
    headline: "Federally funded research is on the line.",
    body: "Universities are an under-served corner of the CMMC ecosystem and the most painful, because the campus network model fights cleanly with the CUI enclave model. We work with research VPs and CIOs to design segregated research enclaves that protect federally funded research without rewriting institutional networks.",
    typical: [
      "DARPA, ONR, or AFRL research awards",
      "Federated identity and BYOD complications",
      "Decentralized governance across colleges and labs"
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
            Where CUI lives, <span className="gold-text">we sit.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            CMMC is one standard; the playbook to reach it is not. The path for a $20M
            subcontractor with one prime is not the path for a $3B systems integrator. We pattern
            our engagements to the operating reality.
          </p>
        </div>
      </section>

      <section className="bg-ink-950 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-8">
          {sectors.map((s) => (
            <article
              key={s.code}
              className="grid gap-10 border border-ink-700 bg-ink-900 p-8 lg:grid-cols-[180px_1fr_280px] lg:p-12"
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
                  Typical engagement profile
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
            A 15-minute triage call answers it. Bring your CAGE code and the most painful
            solicitation on your desk.
          </p>
          <Link href="/contact" className="mt-10 inline-block bg-gold-300 px-6 py-4 text-sm font-medium text-ink-950 hover:bg-gold-200">
            Book a Contract Risk Audit &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
