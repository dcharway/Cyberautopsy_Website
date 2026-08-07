import Link from "next/link";
import { FamilyHeatmap } from "@/components/FamilyHeatmap";
import { SPRSScoreCard } from "@/components/SPRSScoreCard";

export const metadata = {
  title: "CMMC Support Services — Level 1, Level 2, and Level 3",
  description:
    "Full-lifecycle CMMC support across every level: readiness and gap assessments, System Security Plans, POA&Ms, control implementation, remediation planning, evidence preparation, and assessment support. Delivered by former DoD assessors as one part of a broader cybersecurity practice."
};

const cmmcServices = [
  {
    title: "Readiness assessments",
    body: "Baseline your current posture against the CMMC level required by your contract or business need. Identify the highest-impact gaps first."
  },
  {
    title: "Gap assessments",
    body: "Control-by-control comparison of current state to the required practices. Prioritised remediation roadmap with time and effort estimates."
  },
  {
    title: "Documentation development",
    body: "System Security Plans, Plans of Action and Milestones, boundary diagrams, policies, and procedures written to withstand C3PAO and DoD scrutiny."
  },
  {
    title: "Control implementation",
    body: "Hands-on remediation with your IT and security teams. We close controls against evidence, not against a checkbox."
  },
  {
    title: "Remediation planning",
    body: "POA&Ms scoped to the CMMC 2.0 rules — surgical use for permitted controls, hard-deadline closure inside the 180-day window."
  },
  {
    title: "Evidence preparation",
    body: "Assessment packets indexed the way an assessor reads them: by control family, by determination statement, with owners named."
  },
  {
    title: "Assessment preparation",
    body: "Pre-assessment walk-throughs, mock interviews, and live escort during the formal C3PAO engagement."
  },
  {
    title: "Continuous monitoring",
    body: "Post-certification drift detection, quarterly re-tests, and annual §170.22 senior-official affirmation support."
  }
];

export default function CMMCSupport() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-30" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:px-10 lg:pt-32 lg:pb-28">
          <span className="classified-stamp">CMMC SUPPORT · ALL LEVELS</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            Full-lifecycle CMMC support.{" "}
            <span className="gold-text">Every level.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            The Cybersecurity Maturity Model Certification program applies to every DoD contractor
            and subcontractor that handles Federal Contract Information or Controlled Unclassified
            Information. We support the readiness, remediation, documentation, and assessment work
            required at every level — as one specialty within our broader{" "}
            <Link href="/services" className="text-gold-300 hover:text-gold-100 underline underline-offset-4">
              cybersecurity and GRC practice
            </Link>
            .
          </p>
        </div>
      </section>

      {/* THE THREE LEVELS */}
      <section className="bg-ink-900 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="classified-stamp">THE THREE LEVELS</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              Your level is dictated by{" "}
              <span className="gold-text">your contract data.</span>
            </h2>
            <p className="mt-6 text-bone-300">
              CMMC 2.0 defines three levels. The one you need is set by the sensitivity of the
              information you handle under contract — not by preference. We help organizations
              confirm the correct target level and build the program to reach it.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            <LevelCard
              tier="LEVEL 01"
              title="Foundational"
              scope="Federal Contract Information (FCI)"
              controls="17 basic safeguarding practices (FAR 52.204-21)"
              assessment="Annual self-assessment"
              audience="Organizations handling only FCI — no CUI."
            />
            <LevelCard
              tier="LEVEL 02"
              title="Advanced"
              scope="Controlled Unclassified Information (CUI)"
              controls="110 controls mapped one-for-one to NIST SP 800-171 Rev. 2"
              assessment="Triennial C3PAO assessment (for most contracts) or self-assessment (for a narrow subset)"
              audience="The majority of DoD contractors handling CUI."
              highlight
            />
            <LevelCard
              tier="LEVEL 03"
              title="Expert"
              scope="Highest-sensitivity CUI, APT-relevant programs"
              controls="Level 2 plus a subset of NIST SP 800-172 enhanced requirements"
              assessment="Government-led assessment"
              audience="Contractors on programs designated for the highest safeguarding requirements."
            />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-ink-950 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="classified-stamp">WHAT WE DELIVER</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              Every stage of the{" "}
              <span className="gold-text">CMMC lifecycle.</span>
            </h2>
            <p className="mt-6 text-bone-300">
              We meet organizations wherever they are on the program — from the first scoping
              conversation to the annual senior-official affirmation years after certification.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cmmcServices.map((s, i) => (
              <div key={s.title} className="border border-ink-700 bg-ink-900 p-6">
                <div className="font-mono text-[11px] tracking-widest2 text-gold-300">
                  0{i + 1}
                </div>
                <h3 className="mt-3 font-serif text-xl text-bone-50">{s.title}</h3>
                <p className="mt-3 text-sm text-bone-300">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEVEL 2 DEEP DIVE — 5 required artifacts */}
      <section className="bg-ink-900 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
            <div>
              <span className="classified-stamp">LEVEL 2 DEEP DIVE · REQUIRED ARTIFACTS</span>
              <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
                Five artifacts every Level 2 assessor asks for{" "}
                <span className="gold-text">on day one.</span>
              </h2>
              <p className="mt-5 text-bone-300 max-w-prose2">
                Level 2 is where most defense contractors need to land. It maps one-for-one to NIST
                SP 800-171 Rev. 2 and is assessed by an accredited C3PAO. Nothing about it is
                improvisational — the assessor opens with these five artifacts.
              </p>
            </div>

            <ol className="space-y-5">
              <Item n="01" title="System Security Plan (SSP)" body="A written description of every system in the CUI boundary and how each of the 110 controls is implemented, by whom, with what tooling, and against what evidence." />
              <Item n="02" title="Plan of Action & Milestones (POA&M)" body="A dated, owned closure plan for any control not fully implemented at the time of score submission. CMMC 2.0 permits a POA&M for a defined subset; high-value controls cannot appear on it." />
              <Item n="03" title="SPRS Score" body="A submitted score in the Supplier Performance Risk System, computed against the 110 controls. The current threshold is 88 of 110, with a 180-day POA&M closure obligation." />
              <Item n="04" title="Authorization Boundary Diagram" body="A signed diagram of the CUI boundary: the systems, data flows, identities, and connections in scope. Out-of-scope exclusions are justified against NIST 800-171A determination statements." />
              <Item n="05" title="Evidence Library" body="Per-control artifacts (configurations, screenshots, signed policies, training records) indexed by family and control number. The packet the assessor actually reads." />
            </ol>
          </div>
        </div>
      </section>

      {/* SPRS DEEP DIVE */}
      <section className="bg-ink-950 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <span className="classified-stamp">SPRS SCORING, EXPLAINED</span>
              <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
                Each unmet control <span className="gold-text">subtracts.</span>
              </h2>
              <div className="mt-6 space-y-5 text-bone-200 max-w-prose2">
                <p>
                  SPRS begins every contractor at 110 and subtracts a weight for each control not
                  fully implemented. Weights run 1, 3, or 5 based on assessed risk impact. The
                  minimum required for award eligibility is currently 88, with a closure plan for
                  the remainder.
                </p>
                <p>
                  A contractor who claims a score of 110 without a defensible evidence packet is
                  volunteering for a False Claims Act exposure. The DOJ&rsquo;s Civil Cyber-Fraud
                  Initiative has already produced multi-million-dollar settlements over inflated
                  scores. The score must be earned, in writing, against artifacts.
                </p>
              </div>

              <ul className="mt-8 space-y-3 text-sm text-bone-200">
                <li className="flex gap-3"><Dot /> 110 starting score, deductions for each unmet control</li>
                <li className="flex gap-3"><Dot /> Weights of 1, 3, 5 based on assessment objective impact</li>
                <li className="flex gap-3"><Dot /> Minimum 88 with POA&M permitted on lower-weight controls</li>
                <li className="flex gap-3"><Dot /> 180-day POA&M closure obligation</li>
                <li className="flex gap-3"><Dot /> Annual affirmation by a senior company official (32 CFR §170.22)</li>
              </ul>
            </div>

            <div className="flex justify-center lg:justify-end">
              <SPRSScoreCard score={97} target={88} variant="pre-engagement" />
            </div>
          </div>
        </div>
      </section>

      {/* 14 FAMILIES */}
      <FamilyHeatmap />

      {/* POA&M RULES */}
      <section className="bg-ink-950 py-24 lg:py-32 border-y border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="classified-stamp">POA&M RULES UNDER CMMC 2.0</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              A POA&M is a scalpel, <span className="gold-text">not a parachute.</span>
            </h2>
            <p className="mt-6 text-bone-300">
              CMMC 2.0 permits a Plan of Action and Milestones at certification — but only against a
              constrained list of controls and only inside a fixed 180-day closure window. Used
              surgically, a POA&M can close the last-mile gap. Used broadly, it is a way to have
              your certification revoked.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <PoamCard ok title="POA&M ALLOWED" body="Lower-weight controls (weight 1) where absence of implementation does not undermine the core protection objective. Examples include certain training documentation gaps." />
            <PoamCard title="POA&M NOT ALLOWED" body="High-impact controls (weight 5). Examples include FIPS-validated cryptography, multifactor authentication for privileged users, and incident reporting to DoD." negative />
            <PoamCard title="POA&M CLOSURE" body="180 days from certification. Failure to close results in suspension of certification. Continuous monitoring keeps the clock visible." />
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-ink-900 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="classified-stamp">REGULATORY TIMELINE</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              The clauses are <span className="gold-text">already live.</span>
            </h2>
          </div>

          <ol className="mt-12 grid gap-4 lg:grid-cols-2">
            <TimelineRow date="2016" event="DFARS 252.204-7012 finalized — CUI safeguarding and 72-hour incident reporting required of all DoD contractors." />
            <TimelineRow date="2020" event="DFARS 7019, 7020, 7021 issued via Interim Rule — SPRS scoring, DoD assessment rights, and CMMC certification clauses." />
            <TimelineRow date="2021" event="CMMC 2.0 announced — collapsed to three levels, NIST 800-171 alignment confirmed, POA&M permitted for limited controls." />
            <TimelineRow date="2024" event="32 CFR Part 170 published (Oct 15, 2024) — formal CMMC program rule, effective December 16, 2024." />
            <TimelineRow date="2025+" event="48 CFR rule phase-in via DFARS — contracting officers begin inserting CMMC certification requirements directly into solicitations." />
            <TimelineRow date="Today" event="Subcontractor flow-down is happening. Primes are requiring evidence of SPRS scores from suppliers as a condition of teaming agreements." gold />
          </ol>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link href="/contact" className="bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200">
              Request a CMMC consultation &rarr;
            </Link>
            <Link href="/services" className="border border-bone-300/30 px-5 py-3 text-sm text-bone-100 hover:border-gold-300 hover:text-gold-300">
              See the full services portfolio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function LevelCard({
  tier,
  title,
  scope,
  controls,
  assessment,
  audience,
  highlight = false
}: {
  tier: string;
  title: string;
  scope: string;
  controls: string;
  assessment: string;
  audience: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "border border-gold-300/50 bg-gold-300/5 p-6 shadow-gilt"
          : "border border-ink-700 bg-ink-950 p-6"
      }
    >
      <div className="font-mono text-[11px] tracking-widest2 text-gold-300">{tier}</div>
      <h3 className="mt-2 font-serif text-2xl text-bone-50">{title}</h3>
      <dl className="mt-5 space-y-3 text-sm">
        <Row label="Scope" value={scope} />
        <Row label="Controls" value={controls} />
        <Row label="Assessment" value={assessment} />
        <Row label="Typical audience" value={audience} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{label}</dt>
      <dd className="mt-1 text-bone-100">{value}</dd>
    </div>
  );
}

function Item({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="border-l border-gold-300/40 pl-5">
      <div className="font-mono text-[11px] tracking-widest2 text-gold-300">{n}</div>
      <div className="mt-1 font-serif text-2xl text-bone-50">{title}</div>
      <p className="mt-2 text-sm text-bone-300">{body}</p>
    </li>
  );
}

function Dot() {
  return <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-300" aria-hidden />;
}

function PoamCard({
  title,
  body,
  ok,
  negative
}: {
  title: string;
  body: string;
  ok?: boolean;
  negative?: boolean;
}) {
  const color = ok
    ? "border-signal-green/50 text-signal-green"
    : negative
    ? "border-signal-red/50 text-signal-red"
    : "border-gold-300/50 text-gold-300";
  return (
    <div className="border border-ink-700 bg-ink-950 p-6">
      <div className={`font-mono text-[11px] tracking-widest2 ${color} border ${color} px-2 py-1 inline-block`}>
        {title}
      </div>
      <p className="mt-4 text-sm text-bone-300">{body}</p>
    </div>
  );
}

function TimelineRow({ date, event, gold }: { date: string; event: string; gold?: boolean }) {
  return (
    <li className={`border ${gold ? "border-gold-300/60 bg-gold-300/5" : "border-ink-700"} p-5`}>
      <div className={`font-mono text-[11px] tracking-widest2 ${gold ? "text-gold-300" : "text-bone-400"}`}>{date}</div>
      <p className="mt-2 text-sm text-bone-100">{event}</p>
    </li>
  );
}
