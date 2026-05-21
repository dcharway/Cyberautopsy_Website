import { ArticleShell } from "@/components/ArticleShell";

export const metadata = {
  title: "CMMC 2.0 vs CMMC 1.0: What Actually Changed",
  description:
    "What collapsed from five levels to three, what survived, and what every DoD contractor needs to internalize. Plain-English read by former assessors."
};

const toc = [
  { id: "what-changed", title: "What actually changed" },
  { id: "five-to-three", title: "Five levels collapsed to three" },
  { id: "self-vs-c3pao", title: "Self-assessment vs C3PAO assessment" },
  { id: "poam-2", title: "POA&Ms returned, under strict rules" },
  { id: "nist-alignment", title: "NIST 800-171 alignment, confirmed" },
  { id: "what-survived", title: "What survived from 1.0" },
  { id: "what-it-means", title: "What it means for you" }
];

const related = [
  { href: "/resources/dfars-7012-obligations", tag: "GUIDE", title: "DFARS 252.204-7012: The 14 Obligations You Must Document" },
  { href: "/resources/poam-mechanics", tag: "GUIDE", title: "POA&M Mechanics Under CMMC 2.0: A Surgical Read" },
  { href: "/cmmc-level-2", tag: "REFERENCE", title: "CMMC Level 2: 110 Controls, SPRS, POA&M, Timeline" }
];

export default function Post() {
  return (
    <ArticleShell
      eyebrow="GUIDE &middot; CMMC FUNDAMENTALS"
      title="CMMC 2.0 vs CMMC 1.0. What actually changed."
      subtitle="The framework collapsed from five levels to three. What survived, what was simplified, and what every DoD contractor needs to internalize before the next solicitation."
      byline="M. Okafor, Managing Partner"
      date="Updated 2026-04-12"
      readingTime="9 min read"
      toc={toc}
      related={related}
    >
      <p>
        In November 2021, the Department of Defense rewrote the CMMC framework. The version most
        contractors had begun preparing for &mdash; with five maturity levels, a heavy emphasis on
        process maturity, and limited room for self-assessment &mdash; was replaced with what we now call
        CMMC 2.0. The rewrite was meant to reduce the burden on small contractors. In practice, the
        changes shifted the burden, they did not remove it.
      </p>

      <p>
        This is the plain-language read of what changed, what survived, and what it means for your
        next bid. Written from inside the assessment community.
      </p>

      <h2 id="what-changed">What actually changed</h2>
      <p>
        Three structural changes define the difference between CMMC 1.0 and CMMC 2.0. Everything
        else is a downstream consequence of these three.
      </p>
      <ol>
        <li>The five maturity levels collapsed to three.</li>
        <li>Self-assessment is allowed at Level 1 and a subset of Level 2.</li>
        <li>POA&amp;Ms are permitted again at certification, with constraints.</li>
      </ol>

      <h2 id="five-to-three">Five levels collapsed to three</h2>
      <p>
        Under CMMC 1.0, contractors faced a five-level ladder. Levels 1 through 3 mapped roughly to
        FAR 52.204-21 and subsets of NIST SP 800-171. Levels 4 and 5 introduced advanced and
        cutting-edge maturity expectations with no clean mapping to existing standards.
      </p>
      <p>
        CMMC 2.0 reorganized into three levels with a clean basis in established federal standards:
      </p>
      <ul>
        <li>
          <strong>Level 1 (Foundational):</strong> Maps to FAR 52.204-21 &mdash; 17 basic safeguarding
          practices for Federal Contract Information (FCI). Annual self-assessment.
        </li>
        <li>
          <strong>Level 2 (Advanced):</strong> Maps to the 110 controls of NIST SP 800-171 Rev. 2. This
          is the bar for any contractor handling Controlled Unclassified Information. C3PAO
          assessment required for prioritized contracts.
        </li>
        <li>
          <strong>Level 3 (Expert):</strong> Maps to a subset of NIST SP 800-172 enhanced controls.
          Assessed by the DoD itself. Reserved for contractors supporting the highest-priority DoD
          programs.
        </li>
      </ul>
      <div className="callout">
        <div className="callout-label">FIELD NOTE</div>
        <p style={{ marginTop: "0.5em" }}>
          If you handle CUI, your target is Level 2. Do not be talked into a higher target unless your
          program of record explicitly requires Level 3.
        </p>
      </div>

      <h2 id="self-vs-c3pao">Self-assessment vs C3PAO assessment</h2>
      <p>
        CMMC 1.0 required third-party assessment at every level above Level 1. CMMC 2.0 introduces
        two pivotal distinctions:
      </p>
      <ul>
        <li>
          <strong>Level 1:</strong> Annual self-assessment, affirmed by a senior official, score posted
          to SPRS.
        </li>
        <li>
          <strong>Level 2 (non-prioritized):</strong> Triennial self-assessment with annual affirmation.
          Limited applicability &mdash; the program rule reserves this for a narrow set of contracts.
        </li>
        <li>
          <strong>Level 2 (prioritized):</strong> Triennial C3PAO assessment, annual affirmation. This
          is the practical bar for the overwhelming majority of contractors handling CUI.
        </li>
        <li>
          <strong>Level 3:</strong> Triennial DoD-led assessment.
        </li>
      </ul>
      <p>
        Self-assessment sounds like a relief. It is not. A self-assessment carries the same legal
        weight as a C3PAO assessment, with one critical difference: when a self-assessed score is
        later found to be inflated, the contractor &mdash; not an assessor &mdash; bears the False Claims Act
        exposure.
      </p>

      <h2 id="poam-2">POA&amp;Ms returned, under strict rules</h2>
      <p>
        CMMC 1.0 was unforgiving: every control had to be implemented at the time of assessment. No
        Plan of Action and Milestones was permitted. CMMC 2.0 restored a constrained POA&amp;M, with
        three guardrails:
      </p>
      <ol>
        <li>
          <strong>A minimum SPRS score</strong> must be achieved at certification (currently 88 of
          110). Below that, no POA&amp;M is permitted at all.
        </li>
        <li>
          <strong>High-value controls cannot be on a POA&amp;M.</strong> Specifically, controls weighted
          at 5 points (e.g., FIPS-validated cryptography, multifactor authentication for privileged
          users, system boundary protection) must be fully implemented.
        </li>
        <li>
          <strong>POA&amp;Ms close in 180 days.</strong> Failure to close results in suspension of
          certification.
        </li>
      </ol>
      <p>
        We treat POA&amp;Ms as a scalpel, not a parachute. The full mechanics live in our companion
        post on{" "}
        <a href="/resources/poam-mechanics">POA&amp;M mechanics under CMMC 2.0</a>.
      </p>

      <h2 id="nist-alignment">NIST 800-171 alignment, confirmed</h2>
      <p>
        CMMC 1.0 introduced practices that did not cleanly map to NIST SP 800-171. Contractors were
        being asked to implement controls that did not exist in any other federal standard, and to
        do so against an assessment methodology that was still being authored. CMMC 2.0 returned to
        a clean alignment: Level 2 is NIST SP 800-171 Rev. 2, full stop.
      </p>
      <p>
        Assessment is performed against the corresponding NIST SP 800-171A determination statements.
        If you read 800-171A carefully, you read CMMC Level 2 assessment.
      </p>

      <h2 id="what-survived">What survived from CMMC 1.0</h2>
      <ul>
        <li>The 110-control inventory of NIST SP 800-171 Rev. 2.</li>
        <li>The C3PAO accreditation pathway and the CMMC-AB (now Cyber AB) governance body.</li>
        <li>The RPO program for readiness providers.</li>
        <li>The federal conflict-of-interest separation between RPO and C3PAO services.</li>
        <li>The SPRS scoring methodology and the &minus;203 to &plus;110 range.</li>
      </ul>

      <h2 id="what-it-means">What it means for you</h2>
      <p>
        If your CMMC 1.0 preparation was thorough, most of it carries forward. The 110-control
        Implementation effort is the same. What changed is the assessment posture and the POA&amp;M
        latitude. The two questions you need to answer this quarter:
      </p>
      <ol>
        <li>
          Is your target Level 1 (FCI only) or Level 2 (CUI handling)? &mdash; the answer is dictated by
          your contract language, not by your IT team&apos;s preference.
        </li>
        <li>
          Will your Level 2 path be self-assessment or C3PAO assessment? &mdash; the answer depends on
          whether your contracting officer has flagged your award as prioritized.
        </li>
      </ol>
      <p>
        Both answers are in your contract or in the prime&apos;s flow-down letter. They are not
        debatable. We help contractors confirm the answer in a 15-minute triage call before they
        spend the first dollar of CMMC budget.
      </p>
    </ArticleShell>
  );
}
