/**
 * FCI Determination questionnaire — the questions, answer scale, and
 * determination logic that decide whether a contract handles FCI, CUI, or
 * enhanced CUI, and therefore whether CMMC (and which level) applies.
 *
 * Sources synthesised into the default question set:
 *   - FAR 52.204-21 (Basic Safeguarding of Covered Contractor Information Systems)
 *   - DFARS 252.204-7012 / 7019 / 7020 / 7021
 *   - 32 CFR Part 2002 (National Archives CUI Program)
 *   - DoDI 5200.48 (Controlled Unclassified Information)
 *   - NIST SP 800-171 / SP 800-172
 *   - 32 CFR Part 170 (CMMC program rule)
 *
 * The logic is deliberately additive + explicit so the assessor can defend
 * the verdict to the contracting officer.
 */

export type AnswerValue = "yes" | "no" | "na" | "unknown" | null;

export type FCIQuestion = {
  id: string;                       // stable slug
  number: string;                   // display label, e.g. "B.3"
  prompt: string;
  hint?: string;                    // hover / helper text
  reference?: string;               // authoritative citation
  /**
   * "positive" indicators contribute toward the section verdict when Yes.
   * "negative" indicators contribute AGAINST the section verdict (e.g. Q5
   * asking whether the info is publicly releasable — if Yes, it argues AWAY
   * from FCI).
   */
  polarity: "positive" | "negative";
};

export type FCISection = {
  id: "identification" | "fci" | "cui" | "enhanced" | "signatures";
  number: string;
  title: string;
  description: string;
  contributesTo: "fci" | "cui" | "enhanced" | null;   // which verdict bucket
  items: FCIQuestion[];
};

export type Verdict =
  | "none"                          // No FCI, no CUI — CMMC not required
  | "fci_only"                      // FCI only — CMMC Level 1
  | "cui"                           // CUI present — CMMC Level 2
  | "enhanced_cui"                  // Enhanced CUI — CMMC Level 3
  | "indeterminate";                // Not enough answered / conflicting

export type ContractHeader = {
  contractNumber: string;
  contractingAgency: string;
  contractType: string;
  periodOfPerformance: string;
  primeOrSub: "" | "prime" | "sub";
  primeContractor: string;         // populated if sub
  contractDescription: string;
};

export type SignatureBlock = {
  preparedByName: string;
  preparedByTitle: string;
  preparedByDate: string;
  approvedByName: string;
  approvedByTitle: string;
  approvedByDate: string;
};

export const ANSWER_OPTIONS: { value: Exclude<AnswerValue, null>; label: string; tone: "ok" | "warn" | "bad" | "neutral" }[] = [
  { value: "yes",     label: "Yes",           tone: "warn" },
  { value: "no",      label: "No",            tone: "ok"   },
  { value: "na",      label: "Not Applicable", tone: "neutral" },
  { value: "unknown", label: "Unknown",       tone: "bad"  }
];

/* -------------------------------------------------------------------------
 * The question set
 * ------------------------------------------------------------------------- */

export const FCI_SECTIONS: FCISection[] = [
  {
    id: "identification",
    number: "A",
    title: "Contract identification",
    description: "Capture the contract this determination applies to. The rest of the questionnaire references it.",
    contributesTo: null,
    items: []            // free-form header fields; see ContractHeader above
  },
  {
    id: "fci",
    number: "B",
    title: "Federal Contract Information (FCI) indicators",
    description:
      "FCI is information not intended for public release, provided by or generated for the Government under a contract to develop or deliver a product or service (FAR 4.1901). Any Yes here triggers FAR 52.204-21 (17 basic safeguarding requirements) and CMMC Level 1 as a minimum.",
    contributesTo: "fci",
    items: [
      {
        id: "b1",
        number: "B.1",
        prompt:
          "Does the contract require the contractor to receive, process, store, or generate information provided by or generated for the Government?",
        reference: "FAR 4.1901",
        polarity: "positive"
      },
      {
        id: "b2",
        number: "B.2",
        prompt:
          "Is the information provided or generated in performance of the contract not intended for public release?",
        reference: "FAR 4.1901",
        polarity: "positive"
      },
      {
        id: "b3",
        number: "B.3",
        prompt: "Does the contract include FAR clause 52.204-21 (Basic Safeguarding of Covered Contractor Information Systems)?",
        reference: "FAR 52.204-21",
        polarity: "positive"
      },
      {
        id: "b4",
        number: "B.4",
        prompt:
          "Will contract-related information be stored, processed, or transmitted on contractor-owned or contractor-managed information systems?",
        reference: "FAR 52.204-21(b)(1)",
        polarity: "positive"
      },
      {
        id: "b5",
        number: "B.5",
        prompt:
          "Is ALL of the contract information publicly releasable (e.g. released on public .gov websites, released to the public by law, or provided as-is on the SF 30 in the public record)?",
        hint:
          "A Yes here argues AGAINST an FCI determination: FCI expressly excludes information the Government has released or intends to release to the public.",
        reference: "FAR 4.1901",
        polarity: "negative"
      }
    ]
  },
  {
    id: "cui",
    number: "C",
    title: "Controlled Unclassified Information (CUI) indicators",
    description:
      "CUI is information the Government creates or possesses that requires safeguarding or dissemination controls consistent with law, regulation, or Government-wide policy (32 CFR Part 2002). Any Yes here upgrades the determination to CMMC Level 2 and triggers NIST SP 800-171.",
    contributesTo: "cui",
    items: [
      {
        id: "c1",
        number: "C.1",
        prompt: "Does the contract include DFARS clause 252.204-7012 (Safeguarding Covered Defense Information and Cyber Incident Reporting)?",
        reference: "DFARS 252.204-7012",
        polarity: "positive"
      },
      {
        id: "c2",
        number: "C.2",
        prompt: "Does the contract include DFARS clause 252.204-7019 or 252.204-7020 (SPRS score / NIST 800-171 assessment requirements)?",
        reference: "DFARS 252.204-7019 / 7020",
        polarity: "positive"
      },
      {
        id: "c3",
        number: "C.3",
        prompt: "Does the contract include DFARS clause 252.204-7021 (CMMC certification requirement)?",
        reference: "DFARS 252.204-7021",
        polarity: "positive"
      },
      {
        id: "c4",
        number: "C.4",
        prompt:
          "Does the contract, task order, SOW, or DD Form 254 identify specific CUI categories (e.g. Controlled Technical Information, Naval Nuclear Propulsion Information, Export Controlled, Privacy)?",
        reference: "DoDI 5200.48; NARA CUI Registry",
        polarity: "positive"
      },
      {
        id: "c5",
        number: "C.5",
        prompt: "Does the contract involve technical data or export-controlled information (ITAR or EAR)?",
        reference: "22 CFR 120-130 (ITAR); 15 CFR 730-774 (EAR)",
        polarity: "positive"
      },
      {
        id: "c6",
        number: "C.6",
        prompt:
          "Will the contractor receive, generate, or handle documents marked with CUI banners such as 'CUI', 'CUI//SP-PRVCY', 'CUI//SP-EXPT', 'CUI//CTI', or equivalent?",
        reference: "DoDI 5200.48; 32 CFR 2002.20",
        polarity: "positive"
      },
      {
        id: "c7",
        number: "C.7",
        prompt:
          "Does this contract flow down from a prime whose SOW or task order has already identified the work as involving CUI or as CMMC-covered?",
        reference: "DFARS 252.204-7012(m) flow-down",
        polarity: "positive"
      },
      {
        id: "c8",
        number: "C.8",
        prompt:
          "Has the DoD sponsoring office, contracting officer, or program office confirmed in writing that CUI is in scope for this contract?",
        reference: "DoDI 5200.48 §3.3",
        polarity: "positive"
      }
    ]
  },
  {
    id: "enhanced",
    number: "D",
    title: "Enhanced CUI (CMMC Level 3) indicators",
    description:
      "Enhanced CUI applies to a limited number of DoD programs designated for the highest safeguarding requirements. Triggers NIST SP 800-172 controls in addition to 800-171 and a government-led CMMC Level 3 assessment.",
    contributesTo: "enhanced",
    items: [
      {
        id: "d1",
        number: "D.1",
        prompt:
          "Is this contract part of a critical program or high-value asset (HVA) designation from the Government?",
        reference: "DoDI 5000.83; DoD CIO HVA guidance",
        polarity: "positive"
      },
      {
        id: "d2",
        number: "D.2",
        prompt:
          "Has the Government designated this contract or program as requiring enhanced protections under NIST SP 800-172?",
        reference: "NIST SP 800-172",
        polarity: "positive"
      },
      {
        id: "d3",
        number: "D.3",
        prompt: "Does the contract or solicitation specifically identify CMMC Level 3 as the required certification level?",
        reference: "DFARS 252.204-7021; 32 CFR Part 170",
        polarity: "positive"
      }
    ]
  },
  {
    id: "signatures",
    number: "E",
    title: "Preparer + approver sign-off",
    description: "Names, titles, and dates for the individuals preparing and approving this determination. Persisted with the record and printed on the PDF.",
    contributesTo: null,
    items: []
  }
];

/* -------------------------------------------------------------------------
 * Determination logic
 * ------------------------------------------------------------------------- */

export type SectionResult = {
  section: FCISection;
  positiveYes: number;    // Yes answers on positive-polarity questions
  negativeYes: number;    // Yes answers on negative-polarity questions (arguments against)
  answered: number;
  total: number;
};

export type DeterminationResult = {
  verdict: Verdict;
  recommendedLevel: 0 | 1 | 2 | 3;
  headline: string;
  rationale: string;
  bySection: SectionResult[];
};

export function scoreSection(
  section: FCISection,
  answers: Record<string, AnswerValue>
): SectionResult {
  let positiveYes = 0;
  let negativeYes = 0;
  let answered = 0;
  for (const q of section.items) {
    const a = answers[q.id];
    if (a === null || a === undefined) continue;
    answered += 1;
    if (a === "yes") {
      if (q.polarity === "positive") positiveYes += 1;
      else negativeYes += 1;
    }
  }
  return { section, positiveYes, negativeYes, answered, total: section.items.length };
}

/**
 * Rules:
 *  - Enhanced (D) has any Yes                       → CMMC Level 3
 *  - CUI (C) has any Yes                            → CMMC Level 2
 *  - FCI (B) has ≥1 positive Yes and no B.5 override→ CMMC Level 1
 *  - FCI (B) has ≥1 positive Yes but Yes to B.5     → Level 1 (with caveat); B.5 alone does not exempt if other positives hold
 *  - All Section B answered No or N/A               → No FCI or CUI, CMMC not required
 *  - Nothing answered in B/C/D                      → indeterminate
 */
export function determine(answers: Record<string, AnswerValue>): DeterminationResult {
  const sections = FCI_SECTIONS.filter((s) => s.contributesTo !== null).map((s) =>
    scoreSection(s, answers)
  );

  const fci = sections.find((r) => r.section.contributesTo === "fci")!;
  const cui = sections.find((r) => r.section.contributesTo === "cui")!;
  const enh = sections.find((r) => r.section.contributesTo === "enhanced")!;

  const totalAnswered = fci.answered + cui.answered + enh.answered;
  if (totalAnswered === 0) {
    return {
      verdict: "indeterminate",
      recommendedLevel: 0,
      headline: "Not enough questions answered to reach a determination.",
      rationale: "Answer at least Sections B and C before requesting a determination.",
      bySection: sections
    };
  }

  if (enh.positiveYes > 0) {
    return {
      verdict: "enhanced_cui",
      recommendedLevel: 3,
      headline: "Enhanced CUI is in scope — CMMC Level 3 required.",
      rationale: buildRationale({ fci, cui, enh, level: 3 }),
      bySection: sections
    };
  }
  if (cui.positiveYes > 0) {
    return {
      verdict: "cui",
      recommendedLevel: 2,
      headline: "CUI is in scope — CMMC Level 2 required.",
      rationale: buildRationale({ fci, cui, enh, level: 2 }),
      bySection: sections
    };
  }
  if (fci.positiveYes > 0) {
    return {
      verdict: "fci_only",
      recommendedLevel: 1,
      headline: "FCI is in scope; CUI is not — CMMC Level 1 required.",
      rationale: buildRationale({ fci, cui, enh, level: 1 }),
      bySection: sections
    };
  }
  return {
    verdict: "none",
    recommendedLevel: 0,
    headline: "No FCI or CUI identified — CMMC not required for this contract.",
    rationale: buildRationale({ fci, cui, enh, level: 0 }),
    bySection: sections
  };
}

function buildRationale(p: {
  fci: SectionResult;
  cui: SectionResult;
  enh: SectionResult;
  level: 0 | 1 | 2 | 3;
}): string {
  const bits: string[] = [];
  if (p.level === 0) {
    bits.push("Every FCI (Section B) and CUI (Section C) indicator was answered No or Not Applicable.");
    bits.push("This contract does not appear to trigger FAR 52.204-21 or CMMC requirements. Retain this determination on file in case scope changes.");
  }
  if (p.level >= 1) {
    bits.push(
      `${p.fci.positiveYes} of ${p.fci.total} FCI indicators (Section B) answered Yes — contract handles Federal Contract Information under FAR 4.1901.`
    );
    if (p.fci.negativeYes > 0) {
      bits.push(
        "Note: at least one 'public-release' indicator (B.5) also answered Yes; verify that the specific information handled is not among the publicly-releasable subset before finalising."
      );
    }
    bits.push("FAR 52.204-21 basic safeguarding applies. CMMC Level 1 (self-assessment, 17 practices) is the minimum required.");
  }
  if (p.level >= 2) {
    bits.push(
      `${p.cui.positiveYes} of ${p.cui.total} CUI indicators (Section C) answered Yes — CUI is in scope.`
    );
    bits.push("DFARS 252.204-7012 obligations apply. CMMC Level 2 (NIST SP 800-171 Rev. 2, 110 controls, C3PAO assessment) is required.");
  }
  if (p.level >= 3) {
    bits.push(
      `${p.enh.positiveYes} of ${p.enh.total} enhanced indicators (Section D) answered Yes — the contract is designated for enhanced safeguarding.`
    );
    bits.push("CMMC Level 3 applies — Level 2 plus a subset of NIST SP 800-172 requirements, assessed by the DoD.");
  }
  return bits.join(" ");
}

/** Convenience: default empty header + signature block (used by the store seeder). */
export const EMPTY_HEADER: ContractHeader = {
  contractNumber: "",
  contractingAgency: "",
  contractType: "",
  periodOfPerformance: "",
  primeOrSub: "",
  primeContractor: "",
  contractDescription: ""
};

export const EMPTY_SIGNATURES: SignatureBlock = {
  preparedByName: "",
  preparedByTitle: "",
  preparedByDate: "",
  approvedByName: "",
  approvedByTitle: "",
  approvedByDate: ""
};
