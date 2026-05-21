import Link from "next/link";
import { FamilyHeatmap } from "@/components/FamilyHeatmap";
import { SPRSScoreCard } from "@/components/SPRSScoreCard";

export const metadata = {
  title: "CMMC Level 2 — The 110 Controls, SPRS, POA&M, and Timeline",
  description:
    "What CMMC Level 2 requires: 110 controls across 14 NIST 800-171 families, SPRS scoring, POA&M rules, and the regulatory timeline. Authored by former DoD assessors."
};

export default function CMMCLevel2() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-30" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:px-10 lg:pt-32 lg:pb-28">
          <span className="classified-stamp">PRACTICE &middot; CMMC LEVEL 2</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            CMMC Level 2.{" "}
            <span className="gold-text">110 controls. 14 families. One certificate.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            Level 2 is the bar required of every DoD contractor or subcontractor that handles
            Controlled Unclassified Information. It maps one-for-one to NIST SP 800-171 Rev. 2 and is
            assessed by an accredited C3PAO. There is no in-between status, no provisional posture,
            no &ldquo;working toward it.&rdquo; You are certified, or you are not.
          </p>
        </div>
      </section>

      {/* WHAT LEVEL 2 REQUIRES */}
      <section className="bg-ink-900 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
            <div>
              <span className="classified-stamp">WHAT LEVEL 2 REQUIRES</span>
              <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
                Five artifacts that must exist before <span className="gold-text">audit day.</span>
              </h2>
              <p className="mt-5 text-bone-300 max-w-prose2">
                Nothing about Level 2 is improvisational. The assessor will ask for these five
                artifacts within the first hour of the engagement. If any of them is unwritten, the
                engagement effectively halts.
              </p>
            </div>

            <ol className="space-y-5">
              <Item n="01" title="System Security Plan (SSP)" body="A written description of every system in the CUI boundary and how each of the 110 controls is implemented, by whom, with what tooling, and against what evidence." />
              <Item n="02" title="Plan of Action & Milestones (POA&M)" body="A dated, owned, closure plan for any control not fully implemented at the time of the score submission. CMMC 2.0 permits a POA&M for a defined subset; high-value controls cannot appear on it." />
              <Item n="03" title="SPRS Score (DoD)" body="A submitted score in the Supplier Performance Risk System computed against the 110 controls. The current threshold is 88 of 110, with a 180-day POA&M closure obligation." />
              <Item n="04" title="Authorization Boundary Diagram" body="A signed diagram of the CUI boundary: the systems, data flows, identities, and connections in scope. Out-of-scope exclusions must be justified to NIST 800-171A determination statements." />
              <Item n="05" title="Evidence Library" body="Per-control artifacts (configurations, screenshots, signed policies, training records) indexed by family and control number. This is the packet the assessor will read." />
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
                  fully implemented. Weights run 1, 3, or 5 based on the assessed risk impact. The
                  arithmetic floor is −203, the ceiling is +110, and the CMMC 2.0 minimum required
                  for award eligibility is currently 88 with a closure plan.
                </p>
                <p>
                  A contractor who claims a score of 110 without a defensible evidence packet behind
                  it is volunteering for a False Claims Act exposure. The DOJ&rsquo;s Civil Cyber-Fraud
                  Initiative has already produced multi-million-dollar settlements over inflated
                  scores. The score must be earned, in writing, against artifacts.
                </p>
              </div>

              <ul className="mt-8 space-y-3 text-sm text-bone-200">
                <li className="flex gap-3"><Dot /> 110 starting score, deductions for each unmet control</li>
                <li className="flex gap-3"><Dot /> Weights of 1, 3, 5 based on assessment objective impact</li>
                <li className="flex gap-3"><Dot /> Minimum 88 with POA&M permitted on lower-weight controls</li>
                <li className="flex gap-3"><Dot /> 180-day POA&M closure obligation</li>
                <li className="flex gap-3"><Dot /> Annual affirmation by a senior company official</li>
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
              surgically, a POA&M lets us deliver a certificate fast and then close the residue. Used
              broadly, it is a way to get your certificate revoked.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <PoamCard ok title="POA&M ALLOWED" body="Lower-weight controls (weight 1) where the absence of implementation does not undermine the core protection objective. Examples include certain training documentation gaps." />
            <PoamCard title="POA&M NOT ALLOWED" body="High-impact controls (weight 5). Examples include FIPS-validated cryptography, multifactor authentication for privileged users, and incident reporting to DoD." negative />
            <PoamCard title="POA&M CLOSURE" body="180 days from certification. Failure to close results in suspension of certification. We track closure inside the Annual Retainer." />
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
            <TimelineRow date="Today" event="Subcontractor flow-down is occurring. Primes are requiring evidence of SPRS scores from suppliers as a condition of teaming agreements." gold />
          </ol>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link href="/services" className="bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200">
              See our four engagement tiers &rarr;
            </Link>
            <Link href="/contact" className="border border-bone-300/30 px-5 py-3 text-sm text-bone-100 hover:border-gold-300 hover:text-gold-300">
              Book a 15-minute triage call
            </Link>
          </div>
        </div>
      </section>
    </>
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
