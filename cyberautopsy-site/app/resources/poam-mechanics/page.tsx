import { ArticleShell } from "@/components/ArticleShell";

export const metadata = {
  title: "POA&M Mechanics Under CMMC 2.0: A Surgical Read",
  description:
    "Which controls are POA&M-eligible. What 180-day closure actually requires. And how poorly written POA&Ms get certifications revoked."
};

const toc = [
  { id: "what-is-poam", title: "What a POA&M is — and is not" },
  { id: "eligibility", title: "POA&M eligibility rules" },
  { id: "score-threshold", title: "The 88-point minimum" },
  { id: "180-days", title: "The 180-day closure clock" },
  { id: "anatomy", title: "Anatomy of a defensible POA&M entry" },
  { id: "revocation", title: "How POA&Ms get certifications revoked" }
];

const related = [
  { href: "/resources/cmmc-2-vs-1", tag: "GUIDE", title: "CMMC 2.0 vs CMMC 1.0: What Actually Changed" },
  { href: "/resources/dfars-7012-obligations", tag: "GUIDE", title: "DFARS 252.204-7012: The 14 Obligations You Must Document" },
  { href: "/cmmc-level-2", tag: "REFERENCE", title: "CMMC Level 2: 110 Controls, SPRS, POA&M, Timeline" }
];

export default function Post() {
  return (
    <ArticleShell
      eyebrow="GUIDE &middot; POA&amp;M MECHANICS"
      title="POA&amp;Ms under CMMC 2.0. A scalpel, not a parachute."
      subtitle="CMMC 2.0 restored the Plan of Action and Milestones to certification, but within tight guardrails. Used surgically, a POA&amp;M shortens your path to award. Used loosely, it is how certifications get revoked."
      byline="R. Vasquez, Lead Compliance Surgeon"
      date="Updated 2026-02-18"
      readingTime="8 min read"
      toc={toc}
      related={related}
    >
      <p>
        Contractors call us in two states. The first call: &ldquo;We have a POA&amp;M with 47 items on it
        and an award decision next quarter.&rdquo; The second call: &ldquo;We hit 110 of 110 and submitted to
        SPRS &mdash; can you confirm we are clear?&rdquo; Both calls are misreads of how POA&amp;Ms work
        under CMMC 2.0.
      </p>
      <p>
        This article is the surgical read. What a POA&amp;M is, what it is not, when you may use one,
        when you cannot, and what the assessor will demand when you do.
      </p>

      <h2 id="what-is-poam">What a POA&amp;M is &mdash; and is not</h2>
      <p>
        A Plan of Action and Milestones is a dated, owned, evidence-backed plan to close a control
        gap. It is a written commitment with three required elements:
      </p>
      <ol>
        <li>An identified, weighted control that is currently not fully implemented.</li>
        <li>A specified remediation activity with a target completion date.</li>
        <li>A named owner who is accountable for closure.</li>
      </ol>
      <p>
        A POA&amp;M is <em>not</em> a list of long-term improvements. It is not a backlog. It is not
        a tracker of features the security team would like to build. Items on a POA&amp;M that do
        not fit the three-element definition above will be rejected on assessor read, and the
        certification path will halt.
      </p>

      <h2 id="eligibility">POA&amp;M eligibility rules</h2>
      <p>
        Under CMMC 2.0, only a constrained subset of controls is eligible to appear on a POA&amp;M at
        certification. The constraint is driven by the SPRS weight of the control.
      </p>
      <ul>
        <li>
          <strong>Weight 1 controls (POA&amp;M eligible):</strong> Lower-impact controls where the
          absence of implementation does not undermine the protection objective. Examples include
          some training documentation gaps and a subset of audit-record retention details.
        </li>
        <li>
          <strong>Weight 3 controls (POA&amp;M eligible in limited cases):</strong> Moderate-impact
          controls. Eligibility is bounded by the overall score floor.
        </li>
        <li>
          <strong>Weight 5 controls (NOT POA&amp;M eligible):</strong> High-impact controls. These
          must be fully implemented at certification. Examples include FIPS-validated cryptography,
          multifactor authentication for privileged users, system boundary protection, and incident
          response reporting to DoD.
        </li>
      </ul>
      <div className="callout">
        <div className="callout-label">FIELD NOTE</div>
        <p style={{ marginTop: "0.5em" }}>
          If a partner offers to put a weight-5 control on your POA&amp;M to &ldquo;buy time,&rdquo;
          end the engagement. The assessment will fail and the firm will not be answerable for it.
        </p>
      </div>

      <h2 id="score-threshold">The 88-point minimum</h2>
      <p>
        SPRS scoring runs from a floor of &minus;203 to a ceiling of &plus;110. Every unmet control
        subtracts its weight from the starting score of 110. The CMMC 2.0 certification minimum is
        a calculated SPRS score of <strong>88</strong>. Below that, no POA&amp;M is permitted; the
        contractor cannot proceed to certification on the strength of a remediation plan alone.
      </p>
      <p>
        Practically, this means a contractor must already be implementing at least 88 of 110 control
        points by weight, with the remaining gap concentrated in POA&amp;M-eligible controls. The
        88-point minimum is the gate before the POA&amp;M discussion can occur.
      </p>

      <h2 id="180-days">The 180-day closure clock</h2>
      <p>
        Every POA&amp;M item carried into certification must close within 180 calendar days of the
        certification date. Closure means the control is moved from POA&amp;M to Implemented, with
        artifacts produced and reviewed. Failure to close within 180 days results in suspension of
        certification. Suspension halts award eligibility immediately.
      </p>
      <p>
        We track POA&amp;M closure inside the Annual Retainer engagement specifically for this reason.
        The 180-day clock arrives faster than most contractors anticipate, and the certificate value
        evaporates if it is missed.
      </p>

      <h2 id="anatomy">Anatomy of a defensible POA&amp;M entry</h2>
      <p>A POA&amp;M entry that survives assessor read contains the following fields:</p>
      <ol>
        <li>
          <strong>Control identifier:</strong> The 800-171 control number (e.g., 3.5.3, 3.13.11).
        </li>
        <li>
          <strong>Assessment objective citation:</strong> The 800-171A determination statements that
          are not yet met.
        </li>
        <li>
          <strong>Current implementation status:</strong> What is in place today, with reference to
          the SSP section that documents it.
        </li>
        <li>
          <strong>Planned remediation:</strong> Specific technical and procedural actions, including
          the systems and stakeholders involved.
        </li>
        <li>
          <strong>Owner:</strong> Named individual, role, and reporting line. &ldquo;The IT team&rdquo;
          is not an owner.
        </li>
        <li>
          <strong>Target completion date:</strong> A specific date inside the 180-day window.
        </li>
        <li>
          <strong>Resourcing:</strong> Budget, headcount, or vendor engagement that supports the
          target date. Plans without resourcing fail.
        </li>
        <li>
          <strong>Verification method:</strong> How closure will be evidenced (configuration export,
          policy document, training record, log sample).
        </li>
      </ol>
      <p>
        Each field maps to a question an assessor will ask. The POA&amp;M is read first and read
        hardest. A defensible entry runs three to six lines per control, with crisp pointers to
        artifacts. A weak entry runs one line and fails on the first follow-up question.
      </p>

      <h2 id="revocation">How POA&amp;Ms get certifications revoked</h2>
      <p>The three most common patterns we have read inside revocation conversations:</p>
      <ul>
        <li>
          <strong>Weight-5 control found on a POA&amp;M.</strong> Often the result of weight mis-tagging
          during gap assessment, or pressure from an unqualified consultant.
        </li>
        <li>
          <strong>180-day clock missed without re-cert.</strong> Contractors who treat the closure
          window as advisory rather than legal.
        </li>
        <li>
          <strong>Annual affirmation submitted with stale evidence.</strong> The senior official
          affirms continued implementation, but a sampled control has drifted. This is treated as a
          material misrepresentation.
        </li>
      </ul>
      <p>
        We use the POA&amp;M instrument deliberately and sparingly. The right number of POA&amp;M items
        at certification is typically between zero and seven. Over that count, the engagement is
        better served by extending Remediation Surge before certification rather than carrying the
        risk into a 180-day window.
      </p>
    </ArticleShell>
  );
}
