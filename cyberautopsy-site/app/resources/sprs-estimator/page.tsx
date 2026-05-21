import Link from "next/link";
import { SPRSEstimator } from "@/components/SPRSEstimator";

export const metadata = {
  title: "SPRS Score Estimator — 10 Questions, Realistic Score",
  description:
    "Ten posture questions mapped to real NIST 800-171 controls and their SPRS weights. The score updates as you answer. Built by former DoD assessors."
};

export default function SPRSEstimatorPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 lg:px-10 lg:pt-28">
          <span className="classified-stamp">TOOL &middot; SPRS ESTIMATOR</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            Estimate your <span className="gold-text">SPRS score.</span>{" "}
            Ten questions. Real weights.
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            Each question bundles real NIST SP 800-171 controls and applies the same weight (1, 3,
            or 5 points) the DoD uses when computing an SPRS submission. Partial implementation
            costs half the full deduction; missing posture costs the full deduction. The result is
            a defensible <em>estimate</em> &mdash; a Gap Assessment is the audit-grade answer.
          </p>
        </div>
      </section>

      {/* TOOL */}
      <section className="bg-ink-950 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SPRSEstimator />
        </div>
      </section>

      {/* METHOD NOTE */}
      <section className="border-y border-ink-700/60 bg-ink-900 py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <span className="classified-stamp">METHOD NOTE</span>
          <h2 className="mt-6 font-serif text-3xl tracking-tightest sm:text-4xl">
            How the math actually works.
          </h2>
          <div className="mt-6 space-y-5 text-bone-200">
            <p>
              SPRS scoring starts every contractor at <strong>110</strong> and deducts a weight for
              each unmet control. The weights are defined in NIST SP 800-171A as 1, 3, or 5 points,
              corresponding to the impact of the control. The arithmetic floor is &minus;203; the
              ceiling is &plus;110; the CMMC 2.0 certification minimum is currently 88.
            </p>
            <p>
              This estimator collapses the 110-control evaluation into 10 questions. Each question
              represents a bundle of related controls. Partial implementation halves the deduction;
              missing posture applies the full deduction. The maximum total deduction in this model
              is roughly 90 points, which gives a realistic range of 20 to 110.
            </p>
            <p>
              The estimator is intentionally conservative. A real SPRS submission requires
              evaluation against the full 110-control inventory using NIST 800-171A determination
              statements, and the artifacts must survive a hostile read. We perform that evaluation
              in our two-week <Link href="/services" className="text-gold-300 hover:text-gold-100">Gap Assessment</Link>{" "}
              engagement.
            </p>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section className="bg-ink-950 py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <span className="classified-stamp">RELATED</span>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Related
              href="/resources/will-i-fail"
              tag="TOOL"
              title="Will I Fail? Self-Assessment"
            />
            <Related
              href="/resources/poam-mechanics"
              tag="GUIDE"
              title="POA&M Mechanics Under CMMC 2.0"
            />
            <Related
              href="/cmmc-level-2"
              tag="REFERENCE"
              title="CMMC Level 2: The 110 Controls"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Related({ href, tag, title }: { href: string; tag: string; title: string }) {
  return (
    <Link
      href={href}
      className="group block border border-ink-700 bg-ink-900 p-6 transition hover:border-gold-300/60"
    >
      <span className="font-mono text-[10px] tracking-widest2 text-gold-300">{tag}</span>
      <h3 className="mt-3 font-serif text-xl text-bone-50 group-hover:text-gold-100">{title}</h3>
      <span className="mt-4 inline-block text-sm text-bone-400 group-hover:text-gold-300">
        Open &rarr;
      </span>
    </Link>
  );
}
