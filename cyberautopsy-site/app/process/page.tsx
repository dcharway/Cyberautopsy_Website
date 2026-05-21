import Link from "next/link";
import { ProcessTimeline } from "@/components/ProcessTimeline";

export const metadata = {
  title: "The CyberAutopsy Method — Diagnose, Expose, Operate, Certify, Monitor",
  description:
    "Five phases. Built from inside dozens of C3PAO assessments. Each phase produces an artifact that survives audit, not a slide that survives a meeting."
};

export default function Process() {
  return (
    <>
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:px-10 lg:pt-32 lg:pb-28">
          <span className="classified-stamp">METHOD</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            The CyberAutopsy Method.
            <br />
            <span className="gold-text">Five phases. No surprises.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            Compliance is a documentation discipline before it is a technology problem. Every phase
            below produces a specific artifact, signed by a specific owner, defensible against a
            specific NIST 800-171A determination statement. The certificate is the byproduct.
          </p>
        </div>
      </section>

      <ProcessTimeline />

      <section className="bg-ink-900 py-24 lg:py-32 border-t border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="classified-stamp">PRINCIPLES</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              How we work, <span className="gold-text">codified.</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Principle
              n="01"
              title="Boundary before tooling"
              body="We do not buy a single license before the CUI boundary is signed. Tooling decisions made before scoping produce overspend and audit headaches."
            />
            <Principle
              n="02"
              title="Artifacts over assertions"
              body="A control is implemented when the artifact survives a hostile read. Until then it is a draft, no matter what the policy says."
            />
            <Principle
              n="03"
              title="Weekly war rooms"
              body="One standing, one-hour engagement per week with the executive sponsor, IT lead, and compliance surgeon. No status decks; only blockers and decisions."
            />
            <Principle
              n="04"
              title="Plain-English deliverables"
              body="Every executive memo is one page, written in language a CFO or contracting officer can read aloud in a meeting."
            />
            <Principle
              n="05"
              title="Evidence as code"
              body="We treat artifacts the way engineers treat code: versioned, reviewed, and signed. The Evidence Library is a repository, not a folder."
            />
            <Principle
              n="06"
              title="No subcontracting of judgment"
              body="A partner signs every Assessment Packet that leaves the firm. No junior staff to assessor handoff. Ever."
            />
          </div>

          <div className="mt-16 text-center">
            <Link href="/contact" className="bg-gold-300 px-6 py-4 text-sm font-medium text-ink-950 hover:bg-gold-200">
              Book a Contract Risk Audit &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Principle({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border border-ink-700 bg-ink-950 p-7">
      <div className="font-mono text-[11px] tracking-widest2 text-gold-300">{n}</div>
      <h3 className="mt-3 font-serif text-2xl text-bone-50">{title}</h3>
      <p className="mt-3 text-sm text-bone-300">{body}</p>
    </div>
  );
}
