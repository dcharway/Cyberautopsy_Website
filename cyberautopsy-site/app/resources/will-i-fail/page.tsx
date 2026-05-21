import Link from "next/link";
import { WillIFail } from "@/components/WillIFail";

export const metadata = {
  title: "Will I Fail? Self-Assessment — Find the 3 Families Most Likely to Drop Your Engagement",
  description:
    "Twelve signal questions, mapped to NIST 800-171 families. Get a ranked view of which families are most likely to fail your C3PAO assessment."
};

export default function WillIFailPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 lg:px-10 lg:pt-28">
          <span className="classified-stamp">TOOL &middot; SELF-ASSESSMENT</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            Will you fail? <span className="gold-text">Probably not.</span> But which three families come closest?
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            Twelve signal questions, drawn from the failure patterns we have read inside dozens of
            C3PAO assessments. Each maps to one or two NIST 800-171 families. The result is a
            ranked view of which families are most likely to drop your engagement &mdash; and which are
            already in good shape.
          </p>
        </div>
      </section>

      {/* TOOL */}
      <section className="bg-ink-950 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <WillIFail />
        </div>
      </section>

      {/* METHOD NOTE */}
      <section className="border-y border-ink-700/60 bg-ink-900 py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <span className="classified-stamp">METHOD NOTE</span>
          <h2 className="mt-6 font-serif text-3xl tracking-tightest sm:text-4xl">
            How the ranking is built.
          </h2>
          <div className="mt-6 space-y-5 text-bone-200">
            <p>
              The twelve questions are not random. Each one targets a posture area that has driven
              an assessment finding for a contractor we have read. The question wording is precise
              because the assessor&apos;s question is precise.
            </p>
            <p>
              Each question contributes weighted risk to one or two NIST 800-171 families. A {" "}
              <strong>No</strong> answer applies the full weight; <strong>Partial</strong> applies
              half; <strong>Yes</strong> applies none. The fourteen families are then ranked by
              accumulated risk, and the top three are surfaced. A family scoring above 2.5 weighted
              points is labeled <strong>high risk</strong>.
            </p>
            <p>
              The ranking is directional, not deterministic. The artifact posture inside each family
              is the audit-grade answer; we produce it in our two-week{" "}
              <Link href="/services" className="text-gold-300 hover:text-gold-100">Gap Assessment</Link>{" "}
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
            <Related href="/resources/sprs-estimator" tag="TOOL" title="SPRS Score Estimator" />
            <Related href="/resources/dfars-7012-obligations" tag="GUIDE" title="DFARS 252.204-7012: The 14 Obligations" />
            <Related href="/cmmc-level-2" tag="REFERENCE" title="CMMC Level 2: The 110 Controls" />
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
      <span className="mt-4 inline-block text-sm text-bone-400 group-hover:text-gold-300">Open &rarr;</span>
    </Link>
  );
}
