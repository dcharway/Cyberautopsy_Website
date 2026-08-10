/**
 * CUI Determination questionnaire — the questions, category catalog, and
 * determination logic that decide whether an information asset is CUI, at
 * what level (Basic vs Specified), and what safeguarding chain applies
 * (32 CFR Part 2002 → NIST SP 800-171 → CMMC Level 2 → optionally NIST SP
 * 800-172 → CMMC Level 3).
 *
 * Regulatory chain synthesised into the default question set:
 *   - Executive Order 13556 (2010)          — created the CUI program
 *   - 32 CFR Part 2002                       — NARA's implementing rule
 *   - NARA CUI Registry                      — authoritative category catalog
 *   - DoDI 5200.48                           — Department of Defense CUI policy
 *   - DFARS 252.204-7012                     — safeguarding covered defense information
 *   - NIST SP 800-171 Rev. 2                 — 110 controls for CUI on nonfederal systems
 *   - NIST SP 800-172                        — enhanced controls for CUI in HVA / critical programs
 *   - 32 CFR Part 170                        — CMMC program rule
 */

export type AnswerValue = "yes" | "no" | "na" | "unknown" | null;

export type CUIQuestion = {
  id: string;
  number: string;
  prompt: string;
  hint?: string;
  reference?: string;
  polarity: "positive" | "negative";
};

export type CUISection = {
  id: "screening" | "specified" | "enhanced" | "signatures";
  number: string;
  title: string;
  description: string;
  contributesTo: "cui" | "specified" | "enhanced" | null;
  items: CUIQuestion[];
};

export type CUIVerdict =
  | "not_cui"
  | "cui_basic"
  | "cui_specified"
  | "enhanced_cui"
  | "indeterminate";

export type InfoAssetHeader = {
  assetName: string;
  description: string;
  source: string;                 // who created / provided the data
  format: string;                 // paper / digital / mixed
  systems: string;                // storage systems
  volume: string;                 // rough count / GB
  dodContractLinked: "" | "yes" | "no";
  linkedContractNumber: string;
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
 * NARA CUI Registry — defense-relevant category catalog
 *
 * The full NARA CUI Registry has ~130 categories across ~20 organizational
 * indices. This set covers the categories a DoD contractor is most likely
 * to encounter. The `specifiedByDefault` flag tracks whether the category
 * is classified as CUI Specified in the Registry (meaning the authorizing
 * law prescribes handling controls beyond the CUI Basic default).
 * ------------------------------------------------------------------------- */

export type CUICategory = {
  code: string;
  name: string;
  organizationalIndex: string;
  specifiedByDefault: boolean;    // true if authorizing law prescribes specific handling
  authority: string;              // top-line legal authority
  hint?: string;
};

export const CUI_CATEGORIES: CUICategory[] = [
  {
    code: "CTI",
    name: "Controlled Technical Information",
    organizationalIndex: "Defense",
    specifiedByDefault: true,
    authority: "DoDI 5230.24; DFARS 252.204-7012",
    hint: "Technical data or computer software with military or space application; distribution-restricted."
  },
  {
    code: "DCRIT",
    name: "DoD Critical Infrastructure Security Information",
    organizationalIndex: "Critical Infrastructure",
    specifiedByDefault: true,
    authority: "10 U.S.C. §130e; DoDI 5200.48"
  },
  {
    code: "EXPT",
    name: "Export Controlled",
    organizationalIndex: "Export Control",
    specifiedByDefault: true,
    authority: "ITAR 22 CFR 120-130; EAR 15 CFR 730-774; 10 U.S.C. §130c"
  },
  {
    code: "EXPTR",
    name: "Export Controlled Research",
    organizationalIndex: "Export Control",
    specifiedByDefault: true,
    authority: "22 CFR 120-130; 15 CFR 730-774"
  },
  {
    code: "NNPI",
    name: "Naval Nuclear Propulsion Information",
    organizationalIndex: "Defense",
    specifiedByDefault: true,
    authority: "DoDI S-5210.20; NAVSEA guidance"
  },
  {
    code: "PRVCY",
    name: "Privacy (Personally Identifiable Information)",
    organizationalIndex: "Privacy",
    specifiedByDefault: true,
    authority: "5 U.S.C. §552a (Privacy Act); OMB M-17-12"
  },
  {
    code: "HLTH",
    name: "Health Information",
    organizationalIndex: "Privacy",
    specifiedByDefault: true,
    authority: "HIPAA 42 U.S.C. §1320d et seq.; 45 CFR 160/164"
  },
  {
    code: "FINCL",
    name: "Financial",
    organizationalIndex: "Financial",
    specifiedByDefault: true,
    authority: "15 U.S.C. §6801-6809 (GLBA); 12 CFR various"
  },
  {
    code: "LEI",
    name: "Law Enforcement Sensitive",
    organizationalIndex: "Law Enforcement",
    specifiedByDefault: true,
    authority: "28 CFR Part 23; DoJ guidance"
  },
  {
    code: "LEGL",
    name: "Legal (Attorney-Client / Work Product)",
    organizationalIndex: "Legal",
    specifiedByDefault: true,
    authority: "Fed. R. Civ. P. 26(b)(3); agency legal guidance"
  },
  {
    code: "PROCUR",
    name: "Procurement and Acquisition",
    organizationalIndex: "Procurement and Acquisition",
    specifiedByDefault: false,
    authority: "FAR 3.104; 41 U.S.C. §2101 et seq."
  },
  {
    code: "SSEL",
    name: "Source Selection Sensitive",
    organizationalIndex: "Procurement and Acquisition",
    specifiedByDefault: true,
    authority: "FAR 3.104; 41 U.S.C. §2101-2107"
  },
  {
    code: "PROPIN",
    name: "General Proprietary Business Information",
    organizationalIndex: "Proprietary Business",
    specifiedByDefault: true,
    authority: "18 U.S.C. §1905; 5 U.S.C. §552(b)(4)"
  },
  {
    code: "OPSEC",
    name: "Operations Security Information",
    organizationalIndex: "Defense",
    specifiedByDefault: false,
    authority: "DoDI 5205.02; NSDD 298"
  },
  {
    code: "STAT",
    name: "Statistical Data",
    organizationalIndex: "Statistical",
    specifiedByDefault: true,
    authority: "44 U.S.C. §3572; CIPSEA 2018"
  },
  {
    code: "TAX",
    name: "Tax Information",
    organizationalIndex: "Tax",
    specifiedByDefault: true,
    authority: "26 U.S.C. §6103"
  },
  {
    code: "GENERAL",
    name: "General / For Official Use Only equivalent",
    organizationalIndex: "General",
    specifiedByDefault: false,
    authority: "32 CFR Part 2002 baseline"
  }
];

/* -------------------------------------------------------------------------
 * The question set
 * ------------------------------------------------------------------------- */

export const CUI_SECTIONS: CUISection[] = [
  {
    id: "screening",
    number: "B",
    title: "CUI screening indicators",
    description:
      "Establish whether this information asset falls within the CUI program at all. Grounded in Executive Order 13556, 32 CFR Part 2002, and DoDI 5200.48. Any Yes on a positive indicator triggers deeper analysis; a Yes on B.3 (public release) argues against CUI status.",
    contributesTo: "cui",
    items: [
      {
        id: "b1",
        number: "B.1",
        prompt:
          "Was this information created by the Federal Government, or created for the Federal Government by the contractor under a contract, grant, or agreement?",
        reference: "EO 13556 §2; 32 CFR §2002.4",
        polarity: "positive"
      },
      {
        id: "b2",
        number: "B.2",
        prompt:
          "Is the information covered by a law, regulation, or Government-wide policy that requires or permits its safeguarding or dissemination controls?",
        hint:
          "This is the definitional test for CUI. If yes, identify the authorizing authority in the rationale note.",
        reference: "32 CFR §2002.4(h); NARA CUI Registry",
        polarity: "positive"
      },
      {
        id: "b3",
        number: "B.3",
        prompt:
          "Has this information already been placed in the public domain — formally released via FOIA, published on a public .gov site, or included in a public press release?",
        hint:
          "A Yes here argues AGAINST CUI status. CUI cannot be information that has been publicly released without restriction.",
        reference: "32 CFR §2002.4(h)",
        polarity: "negative"
      },
      {
        id: "b4",
        number: "B.4",
        prompt:
          "Was the information delivered to or generated by the contractor with CUI markings applied by the originator (e.g. 'CUI', 'CUI//SP-EXPT', 'CUI//SP-PRVCY')?",
        reference: "DoDI 5200.48 §3.4; 32 CFR §2002.20",
        polarity: "positive"
      },
      {
        id: "b5",
        number: "B.5",
        prompt:
          "Is this information handled under a DoD contract that includes DFARS 252.204-7012 (Safeguarding Covered Defense Information)?",
        hint:
          "DFARS 7012 explicitly obligates the contractor to safeguard 'covered defense information', which is CUI in the Defense organizational index.",
        reference: "DFARS 252.204-7012",
        polarity: "positive"
      },
      {
        id: "b6",
        number: "B.6",
        prompt:
          "Has the DoD sponsor, contracting officer, or program office identified this information (or a DD Form 254 CUI block) as CUI?",
        reference: "DoDI 5200.48 §3.3",
        polarity: "positive"
      }
    ]
  },
  {
    id: "specified",
    number: "D",
    title: "CUI Specified indicators",
    description:
      "CUI is either 'Basic' (default handling per 32 CFR Part 2002) or 'Specified' (the authorizing law prescribes handling requirements beyond the default). Specified categories often require Limited Dissemination Controls (LDCs) such as NOFORN, FEDCON, or DL ONLY.",
    contributesTo: "specified",
    items: [
      {
        id: "d1",
        number: "D.1",
        prompt:
          "Does the authorizing law or regulation for this information prescribe SPECIFIC safeguarding or dissemination controls beyond the CUI Basic default in 32 CFR §2002.14?",
        reference: "32 CFR §2002.4(cc); NARA CUI Registry",
        polarity: "positive"
      },
      {
        id: "d2",
        number: "D.2",
        prompt:
          "Do the markings on the information (or the requirement to apply them) include a Limited Dissemination Control such as NOFORN, FEDCON, DL ONLY, or NOCON?",
        reference: "32 CFR §2002.24",
        polarity: "positive"
      },
      {
        id: "d3",
        number: "D.3",
        prompt:
          "Do any of the selected CUI categories carry a distribution statement (Distribution B/C/D/E/F) or an ITAR/EAR export-control marking?",
        reference: "DoDI 5230.24; ITAR 22 CFR 125.4; EAR 15 CFR 734",
        polarity: "positive"
      },
      {
        id: "d4",
        number: "D.4",
        prompt:
          "Does the DoD sponsor or contracting officer's letter (or DD Form 254 CUI block) identify a Specified category by name (e.g. CUI//SP-EXPT, CUI//SP-NNPI)?",
        reference: "DoDI 5200.48 §3.4; NARA CUI Registry",
        polarity: "positive"
      }
    ]
  },
  {
    id: "enhanced",
    number: "E",
    title: "Enhanced protection indicators (NIST SP 800-172 / CMMC Level 3)",
    description:
      "Some CUI is designated for enhanced protections because it supports critical programs or high-value assets. NIST SP 800-172 defines the additional controls; CMMC Level 3 is the certification path.",
    contributesTo: "enhanced",
    items: [
      {
        id: "e1",
        number: "E.1",
        prompt:
          "Is this information associated with a Critical Program, High-Value Asset (HVA), or program of record designated for enhanced safeguarding by the sponsoring agency?",
        reference: "DoDI 5000.83; DoD CIO HVA guidance",
        polarity: "positive"
      },
      {
        id: "e2",
        number: "E.2",
        prompt:
          "Has the Government agency contractually mandated NIST SP 800-172 enhanced controls for this information?",
        reference: "NIST SP 800-172",
        polarity: "positive"
      },
      {
        id: "e3",
        number: "E.3",
        prompt:
          "Is the associated contract designated CMMC Level 3 under DFARS 252.204-7021?",
        reference: "DFARS 252.204-7021; 32 CFR Part 170",
        polarity: "positive"
      }
    ]
  },
  {
    id: "signatures",
    number: "F",
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
  section: CUISection;
  positiveYes: number;
  negativeYes: number;
  answered: number;
  total: number;
};

export type DeterminationResult = {
  verdict: CUIVerdict;
  cuiLevel: "none" | "basic" | "specified" | "enhanced";
  recommendedCMMCLevel: 0 | 1 | 2 | 3;
  headline: string;
  rationale: string;
  bySection: SectionResult[];
  categoryFindings: {
    selected: CUICategory[];
    anySpecified: boolean;
  };
};

export function scoreSection(
  section: CUISection,
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
 *  - Any Section E positive Yes                        → Enhanced CUI  → CMMC L3
 *  - Any Specified indicator (D) positive OR any selected
 *    category is specifiedByDefault                    → CUI Specified → CMMC L2
 *  - Any Section B positive Yes (net of B.3 override) OR
 *    any category selected                             → CUI Basic     → CMMC L2
 *    (B.3 alone does not exempt if other positives hold)
 *  - Nothing indicative                                → Not CUI       → no CMMC required
 *  - Nothing answered at all                           → Indeterminate
 *
 * DoD-context escalation: if B.5 (DFARS 7012) or B.6 (DoD sponsor
 * identification) is Yes, CMMC Level 2 is treated as required regardless of
 * whether the category is Specified. Non-DoD CUI still triggers NIST 800-171
 * per 32 CFR §2002.14 but not CMMC per se.
 */
export function determine(
  answers: Record<string, AnswerValue>,
  selectedCategoryCodes: string[]
): DeterminationResult {
  const sections = CUI_SECTIONS
    .filter((s) => s.contributesTo !== null)
    .map((s) => scoreSection(s, answers));

  const screening = sections.find((r) => r.section.contributesTo === "cui")!;
  const specified = sections.find((r) => r.section.contributesTo === "specified")!;
  const enhanced  = sections.find((r) => r.section.contributesTo === "enhanced")!;

  const selectedCats = CUI_CATEGORIES.filter((c) => selectedCategoryCodes.includes(c.code));
  const anySpecifiedCat = selectedCats.some((c) => c.specifiedByDefault);
  const categoryFindings = { selected: selectedCats, anySpecified: anySpecifiedCat };

  const totalAnswered = screening.answered + specified.answered + enhanced.answered;
  if (totalAnswered === 0 && selectedCats.length === 0) {
    return {
      verdict: "indeterminate",
      cuiLevel: "none",
      recommendedCMMCLevel: 0,
      headline: "Not enough information answered to reach a CUI determination.",
      rationale: "Answer Section B (screening) and identify any CUI categories before requesting a determination.",
      bySection: sections,
      categoryFindings
    };
  }

  const isDoDContext =
    answers.b5 === "yes" || answers.b6 === "yes";

  if (enhanced.positiveYes > 0) {
    return {
      verdict: "enhanced_cui",
      cuiLevel: "enhanced",
      recommendedCMMCLevel: 3,
      headline: "Enhanced CUI — CMMC Level 3 protections required.",
      rationale: buildRationale({
        screening, specified, enhanced, selectedCats, anySpecifiedCat, isDoDContext, level: "enhanced"
      }),
      bySection: sections,
      categoryFindings
    };
  }

  const isSpecified = specified.positiveYes > 0 || anySpecifiedCat;
  const isCUI =
    screening.positiveYes > 0 || selectedCats.length > 0 || isSpecified;

  if (!isCUI) {
    return {
      verdict: "not_cui",
      cuiLevel: "none",
      recommendedCMMCLevel: 0,
      headline: "This information asset does not appear to be CUI.",
      rationale: buildRationale({
        screening, specified, enhanced, selectedCats, anySpecifiedCat, isDoDContext, level: "none"
      }),
      bySection: sections,
      categoryFindings
    };
  }

  if (isSpecified) {
    return {
      verdict: "cui_specified",
      cuiLevel: "specified",
      recommendedCMMCLevel: isDoDContext ? 2 : 0,
      headline: isDoDContext
        ? "CUI Specified — 32 CFR Part 2002 + agency-specific handling + CMMC Level 2."
        : "CUI Specified — 32 CFR Part 2002 + agency-specific handling. NIST SP 800-171 applies.",
      rationale: buildRationale({
        screening, specified, enhanced, selectedCats, anySpecifiedCat, isDoDContext, level: "specified"
      }),
      bySection: sections,
      categoryFindings
    };
  }

  return {
    verdict: "cui_basic",
    cuiLevel: "basic",
    recommendedCMMCLevel: isDoDContext ? 2 : 0,
    headline: isDoDContext
      ? "CUI Basic — 32 CFR Part 2002 baseline + CMMC Level 2."
      : "CUI Basic — 32 CFR Part 2002 baseline. NIST SP 800-171 applies on nonfederal systems.",
    rationale: buildRationale({
      screening, specified, enhanced, selectedCats, anySpecifiedCat, isDoDContext, level: "basic"
    }),
    bySection: sections,
    categoryFindings
  };
}

function buildRationale(p: {
  screening: SectionResult;
  specified: SectionResult;
  enhanced: SectionResult;
  selectedCats: CUICategory[];
  anySpecifiedCat: boolean;
  isDoDContext: boolean;
  level: "none" | "basic" | "specified" | "enhanced";
}): string {
  const bits: string[] = [];

  if (p.level === "none") {
    bits.push("No positive CUI screening indicators (Section B) and no CUI categories selected.");
    if (p.screening.negativeYes > 0) {
      bits.push("The public-release counter-indicator (B.3) also excluded this information from the CUI program.");
    }
    bits.push("No CUI safeguarding requirements apply. Retain this determination in case scope changes.");
    return bits.join(" ");
  }

  bits.push(
    `${p.screening.positiveYes} of ${p.screening.total} CUI screening indicators (Section B) answered Yes.`
  );
  if (p.selectedCats.length > 0) {
    bits.push(
      `Selected NARA CUI categories: ${p.selectedCats.map((c) => `${c.code} (${c.name})`).join(", ")}.`
    );
  }
  if (p.screening.negativeYes > 0) {
    bits.push(
      "Note: B.3 (public release) is also marked Yes — verify the specific subset of the asset is not publicly released before finalising."
    );
  }

  if (p.level === "basic") {
    bits.push(
      "CUI Basic applies: 32 CFR Part 2002 baseline safeguarding and dissemination controls."
    );
    if (p.isDoDContext) {
      bits.push(
        "DoD context confirmed (DFARS 252.204-7012 or DoD sponsor identification) — NIST SP 800-171 Rev. 2 (110 controls) and CMMC Level 2 assessment apply."
      );
    } else {
      bits.push(
        "Non-DoD context — NIST SP 800-171 still applies per 32 CFR §2002.14 for nonfederal systems, but CMMC certification is not compelled by the CUI program alone."
      );
    }
    return bits.join(" ");
  }

  if (p.level === "specified") {
    if (p.anySpecifiedCat) {
      bits.push(
        "At least one selected category is CUI Specified in the NARA Registry, invoking category-specific handling controls."
      );
    }
    if (p.specified.positiveYes > 0) {
      bits.push(
        `${p.specified.positiveYes} of ${p.specified.total} Specified indicators (Section D) also answered Yes.`
      );
    }
    bits.push(
      "CUI Specified applies: 32 CFR Part 2002 baseline PLUS the additional handling requirements prescribed by each category's authorizing law or regulation."
    );
    if (p.isDoDContext) {
      bits.push(
        "DoD context confirmed — NIST SP 800-171 (110 controls) and CMMC Level 2 apply; add any Limited Dissemination Controls (LDCs) marked on the data."
      );
    }
    return bits.join(" ");
  }

  // enhanced
  bits.push(
    `${p.enhanced.positiveYes} of ${p.enhanced.total} enhanced indicators (Section E) answered Yes — this asset is designated for enhanced protections.`
  );
  bits.push(
    "Enhanced CUI applies: NIST SP 800-172 selected controls in addition to NIST SP 800-171, plus CMMC Level 3 certification."
  );
  if (p.anySpecifiedCat) {
    bits.push("Category-specific handling from CUI Specified categories also continues to apply.");
  }
  return bits.join(" ");
}

export const EMPTY_HEADER: InfoAssetHeader = {
  assetName: "",
  description: "",
  source: "",
  format: "",
  systems: "",
  volume: "",
  dodContractLinked: "",
  linkedContractNumber: ""
};

export const EMPTY_SIGNATURES: SignatureBlock = {
  preparedByName: "",
  preparedByTitle: "",
  preparedByDate: "",
  approvedByName: "",
  approvedByTitle: "",
  approvedByDate: ""
};
