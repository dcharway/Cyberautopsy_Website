/**
 * FCI / CUI Scoping Model — classifies applications, technology, and people
 * as in-scope or out-of-scope for CMMC / NIST 800-171 obligations.
 *
 * Grounded in:
 *   - DoD CMMC Assessment Scope Guide (Levels 1, 2, 3)
 *   - NIST SP 800-171 Rev. 2 §2.2 (Application of Requirements)
 *   - DoDI 5200.48 (CUI)
 *   - FAR 52.204-21 (FCI)
 *   - 32 CFR Part 170 (CMMC program rule)
 *
 * The DoD CMMC Assessment Scope Guide (Level 2) defines five asset
 * categories for CUI environments. This module captures them plus two more
 * for FCI-only (Level 1) and pure out-of-scope so a single model covers
 * both Level 1 and Level 2 scoping questions.
 */

export type ScopeCategory =
  | "cui_asset"                  // Processes / stores / transmits CUI
  | "security_protection"        // Provides security capability to CUI env
  | "crma"                       // Contractor Risk Managed Asset — capable but isolated
  | "specialized"                // GFE / OT / IoT / restricted / test equipment
  | "fci_asset"                  // FCI Level 1 asset (no CUI)
  | "out_of_scope";              // Cannot / does not process FCI or CUI

export type ScopeKind = "application" | "technology" | "people";

export type DataType =
  | "CUI"
  | "FCI"
  | "PII"
  | "PHI"
  | "ITAR"
  | "EAR"
  | "Proprietary"
  | "Public"
  | "None";

export type ScopeItem = {
  id: string;
  kind: ScopeKind;
  name: string;
  description: string;
  owner: string;                 // person or team responsible
  location: string;              // for tech: physical/cloud region; for people: dept
  vendor?: string;               // for applications
  boundaryModel: "" | "on-premise" | "private-cloud" | "gcc-high" | "commercial-cloud" | "hybrid" | "vendor-hosted";
  dataTypes: DataType[];
  scopeCategory: ScopeCategory | "";
  scopeRationale: string;        // why this classification
  connectsToCUI: "" | "yes" | "no" | "unknown"; // for CRMA vs OOS decision
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type CategoryMeta = {
  code: ScopeCategory;
  label: string;
  shortLabel: string;
  tone: "critical" | "high" | "medium" | "low" | "none";
  description: string;
  controlsRequired: string;
};

export const CATEGORY_META: Record<ScopeCategory, CategoryMeta> = {
  cui_asset: {
    code: "cui_asset",
    label: "CUI Asset",
    shortLabel: "CUI",
    tone: "critical",
    description:
      "Processes, stores, or transmits Controlled Unclassified Information. Fully in-scope for the assessment.",
    controlsRequired: "All 110 NIST SP 800-171 Rev. 2 controls apply. Included in every SSP + boundary diagram."
  },
  security_protection: {
    code: "security_protection",
    label: "Security Protection Asset",
    shortLabel: "SPA",
    tone: "high",
    description:
      "Provides a security function or capability to the CUI environment (SIEM, VPN concentrator, PAM, backup, IDS/IPS, MFA broker). In-scope.",
    controlsRequired: "All 110 controls apply. Documented in the SSP with the security function it delivers."
  },
  crma: {
    code: "crma",
    label: "Contractor Risk Managed Asset",
    shortLabel: "CRMA",
    tone: "medium",
    description:
      "Capable of processing CUI but is not intended to and is logically or physically isolated from the CUI environment.",
    controlsRequired: "Not assessed against the 110 controls, but MUST be documented in the SSP with the risk-based decision + isolating controls."
  },
  specialized: {
    code: "specialized",
    label: "Specialized Asset",
    shortLabel: "SPEC",
    tone: "medium",
    description:
      "Government-Furnished Equipment (GFE), operational technology (OT), IoT, restricted systems, test equipment. Handled per DoD scoping guide with tailored controls.",
    controlsRequired: "Documented in the SSP. Controls applied to the extent supported by the platform; risk-based rationale for anything not implemented."
  },
  fci_asset: {
    code: "fci_asset",
    label: "FCI Asset (Level 1)",
    shortLabel: "FCI",
    tone: "low",
    description:
      "Processes / stores / transmits Federal Contract Information but not CUI. Level 1 requirements only.",
    controlsRequired: "17 basic safeguarding practices from FAR 52.204-21. CMMC Level 1 self-assessment."
  },
  out_of_scope: {
    code: "out_of_scope",
    label: "Out-of-Scope",
    shortLabel: "OOS",
    tone: "none",
    description:
      "Does not and cannot process FCI or CUI. Documented as such with the physical/logical separation that keeps it out.",
    controlsRequired: "None. Boundary memo documents the exclusion rationale."
  }
};

export const KIND_META: Record<ScopeKind, { label: string; icon: "app" | "tech" | "people"; description: string }> = {
  application: {
    label: "Applications",
    icon: "app",
    description:
      "SaaS, COTS software, custom applications, databases, mobile apps — anything running code that touches or could touch FCI/CUI."
  },
  technology: {
    label: "Technology / Infrastructure",
    icon: "tech",
    description:
      "Servers, endpoints, network devices, storage, cloud services, IoT/OT, printers — the platforms that host the applications."
  },
  people: {
    label: "People / Roles",
    icon: "people",
    description:
      "Named individuals, roles, groups, or contractor personnel who access FCI/CUI as part of their duties."
  }
};

export const DATA_TYPES: DataType[] = [
  "CUI", "FCI", "PII", "PHI", "ITAR", "EAR", "Proprietary", "Public", "None"
];

/**
 * Suggest a scope category from the data types + connectsToCUI signal.
 * Used by the UI to auto-fill on first classification; the assessor can
 * always override.
 */
export function suggestCategory(item: Pick<ScopeItem, "dataTypes" | "connectsToCUI" | "kind">): ScopeCategory | "" {
  const dt = new Set(item.dataTypes);
  if (dt.has("CUI") || dt.has("ITAR")) return "cui_asset";
  if (dt.has("FCI")) return "fci_asset";
  if (item.connectsToCUI === "yes") return "crma";
  if (dt.size === 0 || (dt.size === 1 && (dt.has("Public") || dt.has("None")))) return "out_of_scope";
  return "";
}

/* ---------------- summary + boundary derivation ---------------- */

export type CategorySummary = {
  category: ScopeCategory;
  meta: CategoryMeta;
  applications: number;
  technology: number;
  people: number;
  total: number;
};

export type ScopingSummary = {
  perCategory: CategorySummary[];
  totals: { applications: number; technology: number; people: number; classified: number; unclassified: number };
  boundary: {
    inScopeItems: number;      // CUI + SPA + FCI
    conditionalItems: number;  // CRMA + Specialized
    outOfScope: number;
    unclassified: number;
  };
  headline: string;             // one-line verdict for the workspace banner
  cmmcApplicability: "level_2_or_higher" | "level_1_only" | "none_indicated" | "indeterminate";
};

const IN_SCOPE_CATS: ScopeCategory[] = ["cui_asset", "security_protection", "fci_asset"];
const CONDITIONAL_CATS: ScopeCategory[] = ["crma", "specialized"];

export function summarize(items: ScopeItem[]): ScopingSummary {
  const perCategory: CategorySummary[] = (Object.keys(CATEGORY_META) as ScopeCategory[]).map((cat) => {
    const meta = CATEGORY_META[cat];
    const inCat = items.filter((i) => i.scopeCategory === cat);
    return {
      category: cat,
      meta,
      applications: inCat.filter((i) => i.kind === "application").length,
      technology: inCat.filter((i) => i.kind === "technology").length,
      people: inCat.filter((i) => i.kind === "people").length,
      total: inCat.length
    };
  });

  const totals = {
    applications: items.filter((i) => i.kind === "application").length,
    technology: items.filter((i) => i.kind === "technology").length,
    people: items.filter((i) => i.kind === "people").length,
    classified: items.filter((i) => i.scopeCategory !== "").length,
    unclassified: items.filter((i) => i.scopeCategory === "").length
  };

  const boundary = {
    inScopeItems: items.filter((i) => IN_SCOPE_CATS.includes(i.scopeCategory as ScopeCategory)).length,
    conditionalItems: items.filter((i) => CONDITIONAL_CATS.includes(i.scopeCategory as ScopeCategory)).length,
    outOfScope: items.filter((i) => i.scopeCategory === "out_of_scope").length,
    unclassified: totals.unclassified
  };

  let cmmcApplicability: ScopingSummary["cmmcApplicability"];
  const hasCUI = items.some((i) => i.scopeCategory === "cui_asset" || i.scopeCategory === "security_protection");
  const hasFCI = items.some((i) => i.scopeCategory === "fci_asset");
  if (items.length === 0) cmmcApplicability = "indeterminate";
  else if (hasCUI) cmmcApplicability = "level_2_or_higher";
  else if (hasFCI) cmmcApplicability = "level_1_only";
  else cmmcApplicability = "none_indicated";

  let headline: string;
  if (items.length === 0) {
    headline = "No assets inventoried yet — start by adding applications, technology, and people.";
  } else if (totals.unclassified > 0) {
    headline = `${totals.unclassified} item${totals.unclassified === 1 ? "" : "s"} still need${totals.unclassified === 1 ? "s" : ""} a scope category — assessment boundary is not yet defined.`;
  } else if (hasCUI) {
    headline = `${boundary.inScopeItems} in-scope · ${boundary.conditionalItems} conditional · ${boundary.outOfScope} out-of-scope. CMMC Level 2 or higher applies.`;
  } else if (hasFCI) {
    headline = `${boundary.inScopeItems} FCI-only assets · ${boundary.outOfScope} out-of-scope. CMMC Level 1 applies.`;
  } else {
    headline = "No CUI or FCI assets identified — CMMC does not appear to apply.";
  }

  return { perCategory, totals, boundary, headline, cmmcApplicability };
}

/* ---------------- signature block (matches FCI / CUI determination pages) ---------------- */

export type SignatureBlock = {
  preparedByName: string;
  preparedByTitle: string;
  preparedByDate: string;
  approvedByName: string;
  approvedByTitle: string;
  approvedByDate: string;
};

export const EMPTY_SIGNATURES: SignatureBlock = {
  preparedByName: "",
  preparedByTitle: "",
  preparedByDate: "",
  approvedByName: "",
  approvedByTitle: "",
  approvedByDate: ""
};
