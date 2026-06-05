/**
 * Pre-CMMC Assessment Checklist — static schema.
 *
 * The checklist is the assessor's "4-6 weeks before C3PAO engagement"
 * readiness walkthrough. Six sections + three required diagrams + a notes
 * field. Per-assessment state lives in lib/precmmc-store.ts and is keyed by
 * the items defined here.
 *
 * Status semantics differ per section, so each section declares its
 * `optionType`:
 *   - tri        : Yes / In Progress / No
 *   - tech       : Implemented / Partial / Not Implemented  (section 3)
 *   - binary     : Yes / No                                  (section 6 go/no-go)
 */

export type StatusOptionType = "tri" | "tech" | "binary";

export type ChecklistItem = {
  id: string;          // unique slug, stable across releases
  label: string;
  requirement: string; // 1-line "what good looks like"
  uploadHint?: string; // suggested artifact name on the upload button
  controlId?: string;  // for section 3 only — NIST 800-53 control ID
};

export type ChecklistSection = {
  id: string;
  number: number;
  title: string;
  description: string;
  optionType: StatusOptionType;
  items: ChecklistItem[];
  // True only for section 6 (go/no-go). Used to block scheduling when any
  // answer is "no".
  blockingForGoLive?: boolean;
};

export const STATUS_OPTIONS: Record<StatusOptionType, { value: string; label: string; tone: "ok" | "warn" | "bad" }[]> = {
  tri: [
    { value: "yes",         label: "Yes",          tone: "ok"   },
    { value: "in-progress", label: "In Progress",  tone: "warn" },
    { value: "no",          label: "No",           tone: "bad"  }
  ],
  tech: [
    { value: "implemented",     label: "Implemented",     tone: "ok"   },
    { value: "partial",         label: "Partial",         tone: "warn" },
    { value: "not-implemented", label: "Not Implemented", tone: "bad"  }
  ],
  binary: [
    { value: "yes", label: "Yes", tone: "ok"  },
    { value: "no",  label: "No",  tone: "bad" }
  ]
};

/** Diagram-upload slots that live above section 1. */
export type DiagramSlot = {
  id: "network-architecture" | "data-flow" | "system-context";
  label: string;
  required: boolean;
  description: string;
  bullets: string[];
};

export const DIAGRAM_SLOTS: DiagramSlot[] = [
  {
    id: "network-architecture",
    label: "Network Architecture Diagram",
    required: true,
    description: "Complete network architecture showing CUI boundaries, firewalls, and segments.",
    bullets: [
      "CUI boundaries and network segments",
      "Firewalls, routers, and security controls",
      "Data flow between systems and external entities",
      "Cloud service provider connections",
      "DMZ zones and isolated networks"
    ]
  },
  {
    id: "data-flow",
    label: "Data Flow Diagram",
    required: true,
    description: "Detailed data flow covering every CUI path from entry to disposal.",
    bullets: [
      "Entry points (email, web, APIs, file uploads)",
      "Processing systems and databases",
      "Storage locations (on-premise, cloud, backups)",
      "Transmission paths (internal and external)",
      "Disposal methods"
    ]
  },
  {
    id: "system-context",
    label: "System Context Diagram",
    required: false,
    description: "High-level system context showing external entities and data flows.",
    bullets: [
      "External entities the system interacts with",
      "Major information flows in and out",
      "Trust boundaries"
    ]
  }
];

/** Allowed upload formats / size cap — used by both client + server validators. */
export const UPLOAD_RULES = {
  acceptedExtensions: [
    "pdf", "png", "jpg", "jpeg", "gif",
    "vsdx", "drawio",
    "doc", "docx", "xls", "xlsx", "txt", "csv", "zip"
  ],
  maxBytes: 50 * 1024 * 1024 // 50 MB
} as const;

export const PRECMMC_SECTIONS: ChecklistSection[] = [
  {
    id: "scoping",
    number: 1,
    title: "Scoping & Data Identification",
    description: "Define and document the boundary of CUI in the environment.",
    optionType: "tri",
    items: [
      {
        id: "s1-cui-boundary",
        label: "CUI boundary defined and documented",
        requirement: "Define the CUI boundary and document it formally."
      },
      {
        id: "s1-data-flow-diagram-complete",
        label: "Data flow diagram completed for all CUI paths",
        requirement: "Create comprehensive data flow diagrams showing all CUI paths.",
        uploadHint: "Data Flow Diagram"
      },
      {
        id: "s1-asset-inventory",
        label: "Full asset inventory completed for in-scope environment",
        requirement: "Complete asset inventory for all in-scope systems."
      },
      {
        id: "s1-esp-csp-identified",
        label: "All External Service Providers / Cloud Service Providers identified",
        requirement: "List all ESPs and CSPs used in the environment."
      },
      {
        id: "s1-esp-csp-fedramp",
        label: "ESP/CSP FedRAMP Moderate or equivalent confirmed",
        requirement: "Verify FedRAMP Moderate or equivalent compliance for all ESPs/CSPs."
      },
      {
        id: "s1-scope-statement",
        label: "Written scope statement approved by leadership",
        requirement: "Create and obtain leadership approval for written scope statement.",
        uploadHint: "Scope Statement"
      }
    ]
  },
  {
    id: "governance",
    number: 2,
    title: "Governance & Documentation",
    description: "Policies, plans, and training that frame the compliance program.",
    optionType: "tri",
    items: [
      {
        id: "s2-ssp-drafted",
        label: "System Security Plan (SSP) drafted for each system in scope",
        requirement: "Draft SSP for each in-scope system.",
        uploadHint: "SSP"
      },
      {
        id: "s2-policies-procedures",
        label: "Policies & procedures written for all 14 NIST 800-171 families",
        requirement: "Write policies and procedures for all 14 control families.",
        uploadHint: "Policies"
      },
      {
        id: "s2-poam-current",
        label: "Plan of Action & Milestones (POA&M) current, with owners + dates",
        requirement: "Maintain current POA&M with assigned owners and due dates.",
        uploadHint: "POA&M"
      },
      {
        id: "s2-ir-plan-tested",
        label: "Incident Response Plan documented and tested in last 12 months",
        requirement: "Document IRP and conduct test within last 12 months.",
        uploadHint: "IRP + Test Report"
      },
      {
        id: "s2-training-completed",
        label: "Cybersecurity awareness + CUI handling training completed + tracked",
        requirement: "Complete and track cybersecurity awareness and CUI handling training.",
        uploadHint: "Training Records"
      },
      {
        id: "s2-sprs-submitted",
        label: "SPRS score calculated and submitted",
        requirement: "Calculate and submit SPRS score.",
        uploadHint: "SPRS Screenshot"
      }
    ]
  },
  {
    id: "technical-control-evidence",
    number: 3,
    title: "Technical Control Evidence",
    description:
      "Per-control implementation status with a pointer to the evidence location. " +
      "Pre-assessment focus: the 22 controls the C3PAO almost always opens with.",
    optionType: "tech",
    items: [
      { id: "s3-ac-1",  controlId: "AC-1",  label: "Access Control Policy and Procedures",    requirement: "Policy + procedures cover AC family." },
      { id: "s3-ac-2",  controlId: "AC-2",  label: "Account Management",                       requirement: "Account lifecycle managed (create / modify / disable)." },
      { id: "s3-ac-3",  controlId: "AC-3",  label: "Access Enforcement",                       requirement: "Logical enforcement aligned to RBAC." },
      { id: "s3-ac-17", controlId: "AC-17", label: "Remote Access",                            requirement: "Remote access policy + MFA + monitoring." },
      { id: "s3-ac-18", controlId: "AC-18", label: "Wireless Access",                          requirement: "Wireless access controlled + WPA3 / NAC." },
      { id: "s3-au-2",  controlId: "AU-2",  label: "Event Logging",                            requirement: "Logged events defined per policy." },
      { id: "s3-au-3",  controlId: "AU-3",  label: "Content of Event Records",                 requirement: "Logs include user, time, source, action." },
      { id: "s3-au-4",  controlId: "AU-4",  label: "Audit Storage Capacity",                   requirement: "Retention sized + alerts on capacity." },
      { id: "s3-au-5",  controlId: "AU-5",  label: "Response to Audit Processing Failures",    requirement: "Alerting on log pipeline failure." },
      { id: "s3-au-6",  controlId: "AU-6",  label: "Audit Review, Analysis, and Reporting",    requirement: "Scheduled review + investigation workflow." },
      { id: "s3-cm-1",  controlId: "CM-1",  label: "Configuration Management Policy",          requirement: "Policy + procedures for CM family." },
      { id: "s3-cm-2",  controlId: "CM-2",  label: "Baseline Configuration",                   requirement: "Documented baseline + drift monitoring." },
      { id: "s3-cm-6",  controlId: "CM-6",  label: "Configuration Settings",                   requirement: "Hardening standard applied (CIS / DISA STIG)." },
      { id: "s3-ia-2",  controlId: "IA-2",  label: "Identification and Authentication (Users)", requirement: "Unique IDs + MFA for all users.", uploadHint: "MFA Config" },
      { id: "s3-ia-5",  controlId: "IA-5",  label: "Authenticator Management",                  requirement: "Lifecycle for credentials + tokens." },
      { id: "s3-sc-7",  controlId: "SC-7",  label: "Boundary Protection",                       requirement: "Boundary devices + rule set documented.", uploadHint: "Firewall Rules" },
      { id: "s3-sc-8",  controlId: "SC-8",  label: "Transmission Confidentiality and Integrity", requirement: "Crypto in transit (TLS 1.2+).", uploadHint: "Encryption Config" },
      { id: "s3-sc-13", controlId: "SC-13", label: "Cryptographic Protection",                  requirement: "FIPS 140-2/3 validated modules in use.", uploadHint: "FIPS 140-2 Cert" },
      { id: "s3-sc-28", controlId: "SC-28", label: "Protection of Information at Rest",         requirement: "AES-256 at rest on CUI stores.", uploadHint: "Encryption Proof" },
      { id: "s3-si-2",  controlId: "SI-2",  label: "Flaw Remediation",                          requirement: "Patch SLA + tracked deployment.", uploadHint: "Patch Reports" },
      { id: "s3-si-3",  controlId: "SI-3",  label: "Malware Protection",                        requirement: "AV / EDR coverage + monitoring.", uploadHint: "AV Config" },
      { id: "s3-si-4",  controlId: "SI-4",  label: "Information System Monitoring",             requirement: "IDS / IPS + SOC monitoring.", uploadHint: "Monitoring Config" }
    ]
  },
  {
    id: "operational-readiness",
    number: 4,
    title: "Operational Readiness",
    description: "The activities that prove the controls work end-to-end.",
    optionType: "tri",
    items: [
      { id: "s4-internal-vuln-scan",      label: "Internal vulnerability scan run + Critical/High findings remediated", requirement: "Run internal scans and remediate Critical / High findings.", uploadHint: "Scan Report" },
      { id: "s4-external-vuln-scan",      label: "External vulnerability scan run + Critical/High findings remediated", requirement: "Run external scans and remediate Critical / High findings.", uploadHint: "Scan Report" },
      { id: "s4-pentest",                 label: "Penetration test completed, if required by contract",                requirement: "Complete pentest if contract requires.", uploadHint: "Pentest Report" },
      { id: "s4-log-review",              label: "Log review process documented with sample reports",                  requirement: "Document log review process with sample reports.", uploadHint: "Log Samples" },
      { id: "s4-mfa-enabled",             label: "MFA enabled for all remote access + privileged accounts",            requirement: "Enable MFA for remote access and privileged accounts.", uploadHint: "MFA Config" },
      { id: "s4-fips-encryption",         label: "FIPS 140-2 encryption verified for CUI at rest and in transit",      requirement: "Verify FIPS 140-2 encryption.", uploadHint: "Encryption Proof" },
      { id: "s4-backup-recovery-tested",  label: "Backup/recovery tested for in-scope systems",                        requirement: "Test backup + recovery for in-scope systems.", uploadHint: "Test Report" },
      { id: "s4-mock-interviews",         label: "Mock assessor interviews conducted with IT + end users",             requirement: "Conduct mock assessor interviews.", uploadHint: "Notes" },
      { id: "s4-tabletop",                label: "Tabletop exercise for CUI incident completed",                        requirement: "Complete tabletop exercise.", uploadHint: "Exercise Report" }
    ]
  },
  {
    id: "vendors-supply-chain",
    number: 5,
    title: "Vendors & Supply Chain",
    description: "Subcontractors and service providers are part of the boundary.",
    optionType: "tri",
    items: [
      { id: "s5-dfars-flowdown",            label: "DFARS 252.204-7012 flow-down confirmed in all subcontracts",  requirement: "Confirm DFARS 252.204-7012 flow-down in subcontracts.", uploadHint: "Contract Clause" },
      { id: "s5-shared-responsibility",     label: "Shared responsibility matrices collected from ESPs/CSPs",     requirement: "Collect shared responsibility matrices from ESPs / CSPs.", uploadHint: "Matrices" },
      { id: "s5-vendor-access-monitored",   label: "Vendor access to CUI documented and monitored",               requirement: "Document and monitor vendor access to CUI.", uploadHint: "Access Logs" }
    ]
  },
  {
    id: "go-no-go",
    number: 6,
    title: "Final Go / No-Go",
    description: "All items must be Yes before the C3PAO assessment is scheduled.",
    optionType: "binary",
    blockingForGoLive: true,
    items: [
      { id: "s6-poam-zero",            label: "Zero open items on POA&M – all gaps closed",                   requirement: "Close all POA&M items before assessment.", uploadHint: "Final POA&M" },
      { id: "s6-evidence-mapped",      label: "All evidence mapped to controls in SSP",                       requirement: "Map all evidence to SSP controls.", uploadHint: "Evidence Matrix" },
      { id: "s6-roles-assigned",       label: "Assessment day roles assigned: Escort, Tech SME, Note-taker",  requirement: "Assign assessment day roles.", uploadHint: "Role Assignment" },
      { id: "s6-c3pao-scheduled",      label: "C3PAO selected and date scheduled",                            requirement: "Select C3PAO and schedule assessment date.", uploadHint: "Confirmation" },
      { id: "s6-leadership-signoff",   label: "Leadership sign-off on assessment readiness",                  requirement: "Obtain leadership sign-off on readiness.", uploadHint: "Sign-off" }
    ]
  }
];

/** Total checklist items across every section (used for the readiness % denominator). */
export const TOTAL_CHECKLIST_ITEMS = PRECMMC_SECTIONS.reduce((s, sec) => s + sec.items.length, 0);
