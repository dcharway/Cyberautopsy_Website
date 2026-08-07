import Link from "next/link";
import {
  ShieldCheck,
  Cloud,
  Cpu,
  GraduationCap,
  Compass,
  Wrench
} from "lucide-react";
import { Hero } from "@/components/Hero";
import { Testimonial } from "@/components/Testimonial";
import { faqSchema } from "@/lib/schema";

export const metadata = {
  title: "CyberAutopsy — Cybersecurity, Risk, and Technology Services",
  description:
    "Risk-based cybersecurity, GRC, cloud, AI, and workforce services for federal agencies, defense contractors, regulated organizations, and commercial businesses."
};

const practices = [
  {
    icon: ShieldCheck,
    tag: "PRACTICE 01",
    title: "Cybersecurity & GRC",
    lede:
      "Identify, manage, and reduce cybersecurity risk while building governance programs that support compliance and mission objectives.",
    bullets: [
      "Program development, maturity assessments, risk modeling",
      "NIST, FedRAMP, CMMC, FISMA, 800-171/800-53, ISO 27001, SOC 2, HIPAA support",
      "SSP, POA&M, control assessments, continuous monitoring",
      "Third-party, supply chain, and vendor risk management",
      "Incident response planning and cyber resilience"
    ],
    href: "/services#cyber-grc"
  },
  {
    icon: Cloud,
    tag: "PRACTICE 02",
    title: "IT & Cloud Services",
    lede:
      "Modernize legacy environments and create secure, scalable technology systems that hold up under audit.",
    bullets: [
      "Cloud security architecture, migration, and configuration reviews",
      "Zero Trust architecture and identity governance",
      "Secure SDLC, application security, API security",
      "Data engineering, analytics, and data science",
      "System integration, testing, and validation"
    ],
    href: "/services#it-cloud"
  },
  {
    icon: Wrench,
    tag: "PRACTICE 03",
    title: "Custom GRC & Risk Engineering",
    lede:
      "Every organization has unique risks. We engineer tailored GRC platforms that turn complex compliance data into actionable insight.",
    bullets: [
      "Custom GRC platform design and development",
      "Quantitative cybersecurity risk modeling",
      "Automated control tracking + assessment workflows",
      "Compliance dashboards + executive reporting",
      "Integration with cloud, identity, ticketing, and enterprise systems"
    ],
    href: "/services#grc-engineering"
  },
  {
    icon: Cpu,
    tag: "PRACTICE 04",
    title: "Cloud, AI & Emerging Tech",
    lede:
      "Adopt AI and cloud responsibly with the governance, privacy, and security controls built in from day one.",
    bullets: [
      "Custom cloud solution architecture",
      "Secure AI / ML integration and custom AI assistants",
      "AI governance, risk management, and responsible-use frameworks",
      "Workflow automation and intelligent process optimization",
      "Data privacy and protection for AI-enabled systems"
    ],
    href: "/services#ai-emerging"
  },
  {
    icon: Compass,
    tag: "PRACTICE 05",
    title: "Mission & Organizational Support",
    lede:
      "Improve operational effectiveness through strategic planning, process optimization, and risk-informed governance.",
    bullets: [
      "Grant management, PPBE support, financial modeling",
      "Fraud, waste, and abuse detection",
      "Business process improvement and optimization",
      "Program management and operational analysis",
      "Change management and organizational development"
    ],
    href: "/services#mission-support"
  },
  {
    icon: GraduationCap,
    tag: "PRACTICE 06",
    title: "Workforce Development & Training",
    lede:
      "Build the people, processes, and knowledge required to sustain secure and high-performing operations.",
    bullets: [
      "Cybersecurity awareness and role-based training",
      "Technical training and professional development programs",
      "Instructional design and curriculum development",
      "Distance learning and eLearning solutions",
      "Tabletop exercises and incident response training"
    ],
    href: "/services#workforce"
  }
];

const industries = [
  { label: "Federal Agencies", detail: "Civilian and defense mission support · FISMA · FedRAMP" },
  { label: "Defense Contractors", detail: "Primes and subs handling CUI · CMMC · DFARS 7012" },
  { label: "Regulated Organizations", detail: "Healthcare · Finance · Energy · Critical infrastructure" },
  { label: "Commercial Businesses", detail: "Growth-stage security programs · SOC 2 · ISO 27001" },
  { label: "Technology Companies", detail: "SaaS security · Product security · Cloud-native controls" }
];

const frameworks = [
  "NIST SP 800-53",
  "NIST SP 800-171",
  "CMMC (all levels)",
  "FedRAMP",
  "FISMA",
  "Zero Trust",
  "ISO 27001",
  "SOC 2",
  "HIPAA",
  "DFARS 252.204-7012 / 7019 / 7020 / 7021",
  "PCI DSS",
  "GDPR / CCPA"
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Hero />

      {/* OPENING STATEMENT */}
      <section className="relative border-b border-ink-700/60 bg-ink-900 py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 text-center">
          <span className="classified-stamp">WHAT WE DO</span>
          <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
            Practical, risk-based solutions across the{" "}
            <span className="gold-text">full cybersecurity lifecycle.</span>
          </h2>
          <p className="mt-6 text-bone-200 max-w-prose2 mx-auto">
            We help organizations strengthen cybersecurity, improve operational resilience, and
            modernize technology environments. Every engagement is scoped to a measurable outcome,
            aligned to a recognized framework where one applies, and staffed with senior
            practitioners &mdash; not portals.
          </p>
        </div>
      </section>

      {/* SIX PRACTICES */}
      <section className="relative bg-ink-950 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="classified-stamp">SIX PRACTICES · ONE PORTFOLIO</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              A broad portfolio, delivered by{" "}
              <span className="gold-text">specialists who ship.</span>
            </h2>
            <p className="mt-6 text-bone-200">
              Cybersecurity, GRC, cloud, AI, mission support, and workforce development. Each
              practice is designed to stand alone or compose with the others when the engagement
              calls for it.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {practices.map((p) => {
              const Icon = p.icon;
              return (
                <article
                  key={p.title}
                  className="flex flex-col border border-ink-700 bg-ink-900 p-6 transition hover:border-gold-300/50"
                >
                  <header className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center border border-gold-300/50 bg-gold-300/5 text-gold-300">
                      <Icon size={18} />
                    </span>
                    <div>
                      <div className="font-mono text-[10px] tracking-widest2 text-gold-300">{p.tag}</div>
                      <h3 className="mt-1 font-serif text-2xl text-bone-50">{p.title}</h3>
                    </div>
                  </header>
                  <p className="mt-4 text-sm text-bone-300">{p.lede}</p>
                  <ul className="mt-4 space-y-1.5 text-[13px] text-bone-200">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span
                          aria-hidden
                          className="mt-1.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold-300 shrink-0"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={p.href}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono tracking-widest2 text-gold-300 hover:text-gold-100"
                  >
                    LEARN MORE &rarr;
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* FRAMEWORKS + INDUSTRIES BAND */}
      <section className="relative bg-ink-900 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <span className="classified-stamp">FRAMEWORKS WE SUPPORT</span>
              <h2 className="mt-6 font-serif text-3xl tracking-tightest sm:text-4xl">
                One framework rarely covers the whole risk.{" "}
                <span className="gold-text">We work across all of them.</span>
              </h2>
              <p className="mt-5 text-bone-300">
                Our practitioners have led programs against federal, commercial, and international
                security standards. We meet you at the framework you already work in — and translate
                across the ones you don&rsquo;t.
              </p>
              <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {frameworks.map((f) => (
                  <li
                    key={f}
                    className="border border-ink-700 bg-ink-950 px-3 py-2 font-mono text-[11px] tracking-widest2 text-bone-200"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="classified-stamp">WHO WE SERVE</span>
              <h2 className="mt-6 font-serif text-3xl tracking-tightest sm:text-4xl">
                Federal, defense, regulated,{" "}
                <span className="gold-text">and commercial.</span>
              </h2>
              <p className="mt-5 text-bone-300">
                From civilian agencies operating under FISMA to defense subcontractors satisfying
                DFARS 7012 to venture-backed SaaS firms preparing for SOC 2 — the delivery model is
                the same: senior operators, fixed scope, measurable outcome.
              </p>
              <ul className="mt-8 space-y-3">
                {industries.map((i) => (
                  <li key={i.label} className="border border-ink-700 bg-ink-950 p-4">
                    <div className="text-bone-50">{i.label}</div>
                    <div className="mt-1 font-mono text-[11px] tracking-widest2 text-bone-400">
                      {i.detail}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CMMC SPOTLIGHT — one practice within the portfolio */}
      <section className="relative bg-ink-950 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <span className="classified-stamp">SPOTLIGHT · CMMC SUPPORT</span>
              <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
                Full-lifecycle CMMC support.{" "}
                <span className="gold-text">Every level.</span>
              </h2>
              <p className="mt-6 text-bone-200 max-w-prose2">
                CMMC is one specialty within our cybersecurity practice, backed by former DoD
                assessors and defense-industry CISOs. We support organizations preparing for a Level
                1 self-assessment, running through Level 2 with a C3PAO, or extending toward the
                enhanced Level 3 requirements.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-bone-200">
                {[
                  "Readiness and gap assessments across all CMMC levels",
                  "System Security Plans, POA&Ms, and evidence preparation",
                  "Control implementation and remediation planning",
                  "SPRS score calculation and submission support",
                  "Annual §170.22 affirmation preparation and ongoing monitoring"
                ].map((s) => (
                  <li key={s} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-2 inline-block h-1.5 w-1.5 rotate-45 bg-gold-300 shrink-0"
                    />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/cmmc-level-2"
                  className="border border-gold-300/40 bg-gold-300/5 px-5 py-3 text-sm text-gold-100 transition hover:bg-gold-300 hover:text-ink-950"
                >
                  Explore CMMC services &rarr;
                </Link>
                <Link
                  href="/services"
                  className="border border-bone-300/30 px-5 py-3 text-sm text-bone-100 transition hover:border-gold-300 hover:text-gold-300"
                >
                  See all services
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Pillar
                code="7012"
                title="Safeguarding CUI"
                body="Adequate security controls and 72-hour cyber incident reporting to DoD via DIBNet."
              />
              <Pillar
                code="7019"
                title="SPRS Score"
                body="Current self-assessment score posted to the Supplier Performance Risk System."
              />
              <Pillar
                code="7020"
                title="Assessment Rights"
                body="DoD assessment rights and flow-down to subcontractors handling CUI."
              />
              <Pillar
                code="7021"
                title="CMMC Certification"
                body="Assessment path aligned to your CMMC level and contractual obligations."
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROOF — testimonial */}
      <section className="relative bg-ink-900 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <span className="classified-stamp">CLIENT VOICE</span>
          <h2 className="mt-6 font-serif text-3xl tracking-tightest sm:text-4xl">
            Senior operators.{" "}
            <span className="gold-text">On your side of the table.</span>
          </h2>
          <div className="mt-10">
            <Testimonial
              quote="They sat on our side of the table. The assessor opened a finding, our surgeon produced the artifact from the SSP appendix, and the finding closed before lunch. That is the only reason we kept the contract."
              attribution="Chief Information Security Officer"
              org="Tier-1 Defense Manufacturer"
              metric={{ label: "Contract preserved", value: "$48M" }}
            />
          </div>
        </div>
      </section>

      {/* OUR APPROACH */}
      <section className="relative bg-ink-950 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <div>
              <span className="classified-stamp">OUR APPROACH</span>
              <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
                Risk first. <span className="gold-text">Framework second.</span>
              </h2>
              <p className="mt-6 text-bone-300 max-w-prose2">
                Checklist compliance is fragile — one control lapse, one out-of-date artifact, and
                the whole posture unravels. We build programs that hold up because the underlying
                risk is understood, prioritized, and instrumented. Framework alignment follows.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  n: "01",
                  t: "Understand the risk",
                  d: "Business, technical, regulatory. We map what actually matters before we score a single control."
                },
                {
                  n: "02",
                  t: "Instrument the program",
                  d: "Policies, controls, evidence workflows, and the tooling to keep them current between audits."
                },
                {
                  n: "03",
                  t: "Prove it under audit",
                  d: "Assessment packets built the way the assessor reads them. We sit beside you when it counts."
                },
                {
                  n: "04",
                  t: "Sustain the posture",
                  d: "Continuous monitoring, drift detection, and annual affirmation — because certification is not the end."
                }
              ].map((s) => (
                <div key={s.n} className="border border-ink-700 bg-ink-900 p-6">
                  <div className="font-mono text-[11px] tracking-widest2 text-gold-300">{s.n}</div>
                  <h3 className="mt-2 font-serif text-xl text-bone-50">{s.t}</h3>
                  <p className="mt-2 text-sm text-bone-300">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="relative border-t border-ink-700/70 bg-ink-900 py-24">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-10">
          <span className="classified-stamp">START A CONVERSATION</span>
          <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
            Tell us what you&rsquo;re trying to protect.
          </h2>
          <p className="mt-5 text-bone-300 max-w-2xl mx-auto">
            A 20-minute call with a partner. Whether the ask is a CMMC gap assessment, a Zero Trust
            reference architecture, a SOC 2 program stand-up, or a custom GRC tool build — we
            scope, price, and staff engagements from senior practitioners.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center gap-2 bg-gold-300 px-6 py-4 text-sm font-medium tracking-wide text-ink-950 hover:bg-gold-200"
          >
            Request Consultation &rarr;
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
