import Link from "next/link";
import { Hero } from "@/components/Hero";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { FamilyHeatmap } from "@/components/FamilyHeatmap";
import { SPRSScoreCard } from "@/components/SPRSScoreCard";
import { Testimonial } from "@/components/Testimonial";
import { RiskCalculator } from "@/components/RiskCalculator";
import { faqSchema } from "@/lib/schema";

export const metadata = {
  title: "CyberAutopsy — CMMC Accreditation. Guaranteed.",
  description:
    "For DoD contractors who can't afford to lose the next award. An RPO partnered with C3PAOs. Gap to SPRS submission in 90 days. Certified or we don't stop."
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Hero />

      {/* THE DEADLINE */}
      <section className="relative border-b border-ink-700/60 bg-ink-900 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <span className="classified-stamp">THE DEADLINE</span>
              <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
                The clause is already in your <span className="gold-text">next contract.</span>
              </h2>
              <div className="mt-6 space-y-5 text-bone-200 max-w-prose2">
                <p>
                  DFARS 252.204-7021 flows down to every contractor and subcontractor that touches
                  Controlled Unclassified Information. Without a CMMC Level 2 certificate from an
                  accredited C3PAO, contracting officers cannot make award. There is no waiver. There
                  is no parallel path.
                </p>
                <p>
                  The phase-in is no longer hypothetical. Solicitations are already requiring it.
                  Subcontractors are being de-scoped for the absence of an SPRS score. The window to
                  treat CMMC as a future problem closed in the last fiscal year.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/cmmc-level-2"
                  className="border border-bone-300/30 px-5 py-3 text-sm text-bone-100 transition hover:border-gold-300 hover:text-gold-300"
                >
                  Read the regulatory timeline &rarr;
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Pillar
                code="7012"
                title="Safeguard CUI"
                body="Adequate security and 72-hour cyber incident reporting to DoD via DIBNet."
              />
              <Pillar
                code="7019"
                title="SPRS Score"
                body="A current self-assessment score posted to the Supplier Performance Risk System."
              />
              <Pillar
                code="7020"
                title="Assessment Rights"
                body="DoD assessment rights and flow-down to subcontractors handling CUI."
              />
              <Pillar
                code="7021"
                title="CMMC Certification"
                body="The certification requirement clause. No certificate, no award eligibility."
              />
            </div>
          </div>
        </div>
      </section>

      {/* 110 CONTROLS HEATMAP */}
      <FamilyHeatmap />

      {/* PROOF: SPRS + TESTIMONIAL */}
      <section className="relative bg-ink-950 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <span className="classified-stamp">CASE FILE &middot; 2025-Q1</span>
              <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
                A $200M defense manufacturer. <br />
                <span className="gold-text">$48M contract saved.</span>
              </h2>
              <p className="mt-6 text-bone-200 max-w-prose2">
                Engaged on a Friday after a prime threatened to re-compete a five-year award. We
                rebuilt the SSP from the data flow up, closed 47 controls in 11 weeks, and walked
                their C3PAO through the Assessment Packet line by line. The certificate landed two
                weeks before the option year exercise.
              </p>

              <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                <Metric k="89 d" v="To audit-ready" />
                <Metric k="47" v="Controls closed" />
                <Metric k="0" v="Findings on retest" />
              </dl>

              <div className="mt-10">
                <Testimonial
                  quote="They sat on our side of the table. The C3PAO opened a finding, our compliance surgeon produced the artifact from the SSP appendix, and the finding closed before lunch. That is the only reason we kept the contract."
                  attribution="Chief Information Security Officer"
                  org="$200M Defense Manufacturer &middot; Tier-1 DoD Supplier"
                  metric={{ label: "Contract preserved", value: "$48M" }}
                />
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <SPRSScoreCard score={110} target={88} />
            </div>
          </div>
        </div>
      </section>

      {/* SURGICAL PROCESS */}
      <ProcessTimeline />

      {/* WHY C3PAOs TRUST OUR CLIENTS */}
      <section className="relative bg-ink-900 py-24 lg:py-32 border-y border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="classified-stamp">WHY C3PAOs TRUST OUR CLIENTS</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              We build your Assessment Packet
              <br /> <span className="gold-text">like we are the assessor.</span>
            </h2>
            <p className="mt-6 text-bone-200">
              Federal conflict-of-interest rules prohibit one firm from serving as both your RPO and
              your C3PAO. That separation exists for good reason. It also means most contractors
              walk into assessment with a packet the assessor has never seen. We do not. Every
              artifact we produce is structured to the exact evidence taxonomy a C3PAO uses on day
              one.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <Pillar
              code="A"
              title="Evidence taxonomy"
              body="Artifacts indexed by control, family, and assessment objective — not by IT system. Mirrors how the assessor reads it."
            />
            <Pillar
              code="B"
              title="Defensible scoping"
              body="Boundary memo signed by your CIO. Out-of-scope justifications keyed to NIST SP 800-171A determination statements."
            />
            <Pillar
              code="C"
              title="Real-time defense"
              body="Audit Escort sits in the engagement. Findings answered with documentation already drafted — not promises."
            />
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="relative bg-ink-950 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <span className="classified-stamp">THE TEAM</span>
              <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
                Former DoD assessors. Former CISOs. <span className="gold-text">No juniors on your engagement.</span>
              </h2>
              <p className="mt-5 text-bone-300 max-w-prose2">
                Our partners have led C3PAO assessments, signed off on Authorization Boundaries inside
                the defense industrial base, and run information security for primes with active CUI
                obligations. You are not assigned a portal. You are assigned a person.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 text-sm text-gold-300 hover:text-gold-100"
              >
                Read founder story <span aria-hidden>&rarr;</span>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TeamCard
                name="M. Okafor"
                role="Founder &middot; Managing Partner"
                bio="Former Lead Assessor at a CMMC-AB authorized C3PAO. 60+ assessments closed."
              />
              <TeamCard
                name="A. Sterling"
                role="Director, Compliance Engineering"
                bio="Former CISO at a Tier-1 prime. Built CUI enclave for a $1.2B program."
              />
              <TeamCard
                name="R. Vasquez"
                role="Lead Compliance Surgeon"
                bio="Ten years inside DCMA. NIST 800-171 assessment expert."
              />
              <TeamCard
                name="K. Iwu"
                role="Partner, Audit Escort Practice"
                bio="Sat on the assessor side of 40+ engagements. Knows the failure patterns cold."
              />
            </div>
          </div>
        </div>
      </section>

      {/* RISK CALCULATOR */}
      <RiskCalculator />

      {/* CTA BAND */}
      <section className="relative border-t border-ink-700/70 bg-ink-900 py-24">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-10">
          <span className="classified-stamp">15-MINUTE TRIAGE</span>
          <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
            Book a Contract Risk Audit.
          </h2>
          <p className="mt-5 text-bone-300 max-w-2xl mx-auto">
            Direct call with a partner. We qualify your CAGE code, contract value at risk, and CUI
            footprint, then tell you — straight — whether you should be alarmed. No pitch deck.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center gap-2 bg-gold-300 px-6 py-4 text-sm font-medium tracking-wide text-ink-950 hover:bg-gold-200"
          >
            Book the call &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}

function Pillar({ code, title, body }: { code: string; title: string; body: string }) {
  return (
    <div className="border border-ink-700 bg-ink-950 p-6">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] tracking-widest2 text-gold-300">DFARS &middot; {code}</span>
      </div>
      <h3 className="mt-3 font-serif text-2xl text-bone-50">{title}</h3>
      <p className="mt-2 text-sm text-bone-300">{body}</p>
    </div>
  );
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-serif text-3xl text-gold-300">{k}</div>
      <div className="mt-1 text-[11px] uppercase tracking-widest text-bone-400">{v}</div>
    </div>
  );
}

function TeamCard({ name, role, bio }: { name: string; role: string; bio: string }) {
  return (
    <div className="border border-ink-700 bg-ink-900 p-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 border border-gold-300/40 bg-gold-300/5" aria-hidden />
        <div>
          <div className="font-serif text-lg text-bone-50">{name}</div>
          <div className="text-[11px] uppercase tracking-widest text-bone-400">{role}</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-bone-300">{bio}</p>
    </div>
  );
}
