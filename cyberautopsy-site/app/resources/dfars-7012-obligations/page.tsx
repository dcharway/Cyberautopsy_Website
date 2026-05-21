import { ArticleShell } from "@/components/ArticleShell";

export const metadata = {
  title: "DFARS 252.204-7012: The 14 Obligations You Must Document",
  description:
    "The 14 substantive obligations under DFARS 252.204-7012 — CUI safeguarding, cyber incident reporting, flow-down — distilled into a one-page audit checklist."
};

const toc = [
  { id: "context", title: "Context: why 7012 still matters" },
  { id: "the-14", title: "The 14 obligations" },
  { id: "incident-reporting", title: "Incident reporting in detail" },
  { id: "flow-down", title: "Flow-down to subcontractors" },
  { id: "evidence", title: "What auditors actually ask to see" },
  { id: "common-failures", title: "Common 7012 failure patterns" }
];

const related = [
  { href: "/resources/cmmc-2-vs-1", tag: "GUIDE", title: "CMMC 2.0 vs CMMC 1.0: What Actually Changed" },
  { href: "/resources/poam-mechanics", tag: "GUIDE", title: "POA&M Mechanics Under CMMC 2.0: A Surgical Read" },
  { href: "/services", tag: "SERVICES", title: "Gap Assessment, Remediation Surge, Audit Escort" }
];

export default function Post() {
  return (
    <ArticleShell
      eyebrow="GUIDE &middot; DFARS 7012"
      title="DFARS 252.204-7012. The 14 obligations you must document."
      subtitle="The oldest of the four DFARS cybersecurity clauses. Still the foundation of every CMMC engagement. Here is every obligation, in plain English, with the evidence an assessor will demand."
      byline="A. Sterling, Director, Compliance Engineering"
      date="Updated 2026-03-22"
      readingTime="11 min read"
      toc={toc}
      related={related}
    >
      <p>
        DFARS 252.204-7012 has been federal contract law since 2016. It predates CMMC by half a
        decade and survives every revision of the program. If you sign a contract that contains
        7012 &mdash; and you do &mdash; you have already agreed to fourteen specific cybersecurity
        obligations, with or without a CMMC certificate. This article catalogs every one of them.
      </p>

      <h2 id="context">Context: why 7012 still matters</h2>
      <p>
        Contractors often treat 7012 as a deprecated formality that CMMC will absorb. It will not.
        CMMC is the certification framework. 7012 is the underlying obligation. Even after you
        achieve Level 2, 7012 governs your conduct during a cyber incident, your obligations to
        report to DoD, your media protection requirements, and your flow-down language to
        subcontractors. The clause continues to operate as the substantive legal floor.
      </p>
      <p>
        The Department of Justice has settled multiple False Claims Act matters against contractors
        whose actual 7012 compliance fell short of what they had represented to contracting
        officers. The Civil Cyber-Fraud Initiative was specifically built to surface these cases.
        Treat 7012 as a clause that will be read line by line in litigation.
      </p>

      <h2 id="the-14">The 14 obligations, catalogued</h2>
      <p>The clause produces fourteen substantive obligations. We number them here for the audit checklist.</p>

      <ol>
        <li>
          <strong>Adequate security on covered contractor information systems.</strong> Implement NIST
          SP 800-171 across every system that processes, stores, or transmits Covered Defense
          Information (CDI), which subsumes CUI.
        </li>
        <li>
          <strong>Submit a Plan of Action.</strong> Where any 800-171 control is not implemented, a
          documented POA&amp;M must exist with milestone dates and a designated owner.
        </li>
        <li>
          <strong>Implement the cloud service requirements.</strong> If a cloud service stores or
          transmits CDI, that service must meet FedRAMP Moderate equivalency or be authorized at a
          higher level.
        </li>
        <li>
          <strong>Discover and report cyber incidents within 72 hours.</strong> Reporting goes to
          DoD CYBER via{" "}
          <a href="https://dibnet.dod.mil" target="_blank" rel="noopener noreferrer">DIBNet</a>{" "}
          and must include the standard incident report fields.
        </li>
        <li>
          <strong>Preserve affected media for 90 days.</strong> Images and forensic captures of
          affected systems must be retained for at least ninety days after an incident report is
          filed.
        </li>
        <li>
          <strong>Submit malicious software discovered during an incident.</strong> Specimens are
          submitted to the DoD Cyber Crime Center (DC3).
        </li>
        <li>
          <strong>Facilitate DoD damage assessment.</strong> Provide access, including remote access,
          to DoD personnel performing damage assessment, subject to the clause&apos;s confidentiality
          terms.
        </li>
        <li>
          <strong>Identify and report subcontractor incidents.</strong> Incidents affecting
          subcontractors who flow down 7012 must be reported up the chain.
        </li>
        <li>
          <strong>Flow down the clause to subcontractors.</strong> The clause must appear, without
          alteration of its terms, in subcontracts that involve CDI handling.
        </li>
        <li>
          <strong>Notify the Contracting Officer of inability to comply.</strong> If a system cannot
          meet 800-171, written notice to the Contracting Officer is required before contract
          performance begins.
        </li>
        <li>
          <strong>Implement information system security continuous monitoring.</strong> Continuous
          monitoring is treated as a steady-state obligation, not a project deliverable.
        </li>
        <li>
          <strong>Maintain DOD-issued PKI when required.</strong> Where the contract requires
          DoD-issued PKI, the certificates and associated infrastructure must be maintained.
        </li>
        <li>
          <strong>Protect attorney-client privileged communications during incident response.</strong>{" "}
          The clause anticipates that incident response will produce privileged work product and
          provides for its protection.
        </li>
        <li>
          <strong>Cooperate with DoD-directed remediation.</strong> Remedial measures directed by
          the DoD in connection with a damage assessment must be implemented.
        </li>
      </ol>

      <h2 id="incident-reporting">Incident reporting in detail</h2>
      <p>
        The 72-hour clock is the most operationally consequential element of the clause. It begins
        on discovery, not on confirmation. The DIBNet portal requires:
      </p>
      <ul>
        <li>A description of the incident, the affected information, and the affected systems.</li>
        <li>The actions taken or planned to mitigate.</li>
        <li>The estimated impact to operations.</li>
        <li>The point of contact and CAGE code.</li>
      </ul>
      <p>
        We routinely run tabletop exercises with clients to rehearse the 72-hour clock. The teams
        that fail are not the teams without technology; they are the teams without a designated
        DIBNet submitter, a draft narrative template, and a senior official empowered to submit
        before legal sign-off is complete.
      </p>

      <h2 id="flow-down">Flow-down to subcontractors</h2>
      <p>
        Item 9 above &mdash; the flow-down obligation &mdash; is where most contractor litigation begins. Two
        rules to internalize:
      </p>
      <ul>
        <li>
          You must flow the clause down <em>without alteration of its terms</em>. You may add
          obligations on top, but you may not remove or soften any of the fourteen items above.
        </li>
        <li>
          You must flow it down to <em>every subcontractor that will handle CDI</em>, regardless of
          subcontract value. There is no de minimis exception.
        </li>
      </ul>

      <h2 id="evidence">What auditors actually ask to see</h2>
      <p>
        In a C3PAO assessment, 7012 obligations are evidenced primarily through the System Security
        Plan, but several artifacts are inspected independently:
      </p>
      <ol>
        <li>The DIBNet incident reporting playbook with named submitter and runbook.</li>
        <li>Tabletop exercise records covering 7012 reporting timelines.</li>
        <li>Sample subcontract showing the flow-down clause inserted verbatim.</li>
        <li>Cloud service authorization documentation (FedRAMP letter or equivalency memo).</li>
        <li>Media preservation policy and at least one preservation record from a prior incident or tabletop.</li>
      </ol>
      <div className="callout">
        <div className="callout-label">FIELD NOTE</div>
        <p style={{ marginTop: "0.5em" }}>
          We have never read a CMMC engagement where the contractor produced clean evidence for all
          five artifacts above on the first request. The cloud equivalency memo and the
          subcontract-flow-down sample are the two most often missing.
        </p>
      </div>

      <h2 id="common-failures">Common 7012 failure patterns</h2>
      <ul>
        <li>
          <strong>The 72-hour clock starts at confirmation, not discovery.</strong> Contractors who
          require legal sign-off before DIBNet submission routinely miss the window. Build the
          authority to submit a preliminary report into the playbook.
        </li>
        <li>
          <strong>Cloud service inventory is unmaintained.</strong> Marketing teams, HR vendors, and
          contract management tools quietly accumulate CUI access without being on the security
          inventory.
        </li>
        <li>
          <strong>Subcontract templates lag the procurement reality.</strong> The master subcontract
          template contains 7012 but the operational purchase orders do not flow it down.
        </li>
        <li>
          <strong>Media preservation policy exists but has never been exercised.</strong> The first
          time you image a host for ninety-day preservation should not be during a live incident.
        </li>
      </ul>
      <p>
        If you would like a partner read of your 7012 posture against the fourteen obligations
        above, our Gap Assessment produces it in two weeks. The assessment artifacts are written in
        the form a C3PAO will accept on day one.
      </p>
    </ArticleShell>
  );
}
