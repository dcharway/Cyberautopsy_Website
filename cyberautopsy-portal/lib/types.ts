export type ControlStatus =
  | "Implemented"
  | "Partial"
  | "Not Implemented"
  | "Not Applicable"
  | "Not Started"
  | "Under Review";

export type FamilyCode =
  | "AC" | "AT" | "AU" | "CA" | "CM" | "CP" | "IA"
  | "IR" | "MA" | "MP" | "PE" | "PS" | "RA" | "SC" | "SI";

export type Control = {
  id: string;            // "AC.1.1.1"
  family: FamilyCode;
  familyName: string;
  name: string;
  requirement: string;
  status: ControlStatus;
  weight: 1 | 3 | 5;     // SPRS weight
  owner?: string;
  evidenceIds: string[];
  poamId?: string | null;
  sspSection: string;    // e.g. "3.1.1"
  systemBoundary: string;
  lastReviewed?: string;
  narrative?: string;
  // Subset of EVIDENCE_CATALOG[control.id].artifacts that the assessor has
  // marked as collected / reviewed for the active assessment. Projected onto
  // the merged Control by lib/control-state.ts; not present on seed data.
  acceptableEvidenceReviewed?: string[];
};

export type Evidence = {
  id: string;
  controlIds: string[];
  family: FamilyCode;
  name: string;
  type: "Config Export" | "Screenshot" | "Policy Doc" | "Log Sample" | "Interview" | "Other";
  fileName: string;
  system: string;
  owner: string;
  collected: string;     // ISO date
  expires?: string;      // ISO date
  status: "Valid" | "Expiring Soon" | "Expired";
};

export type POAM = {
  id: string;            // "POAM-001"
  controlId: string;
  weakness: string;
  risk: "Low" | "Medium" | "High";
  remediationPlan: string;
  scheduledClose: string; // ISO date
  status: "Open" | "In Remediation" | "Pending Review" | "Closed";
  owner: string;
  opened: string;
  comments?: string;
};

export type AssessmentPhase = "Readiness" | "Conformity" | "Reporting" | "Closeout";

export type AssessmentEvent = {
  id: string;
  phase: AssessmentPhase;
  startedAt?: string;
  completedAt?: string;
  blockers: number;
  artifactsDue: number;
  artifactsProvided: number;
};
