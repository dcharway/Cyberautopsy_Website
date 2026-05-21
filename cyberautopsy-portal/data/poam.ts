import type { POAM } from "@/lib/types";

export const POAMS: POAM[] = [
  {
    id: "POAM-005",
    controlId: "3.1.5",
    weakness: "Least privilege review is annual; CMMC expects quarterly with sample evidence.",
    risk: "Medium",
    remediationPlan: "Roll out quarterly privileged-access review with sampled entitlement export.",
    scheduledClose: "2026-07-15",
    status: "Open",
    owner: "A. Lee",
    opened: "2026-04-02"
  },
  {
    id: "POAM-014",
    controlId: "3.1.18",
    weakness: "Mobile device connection control is enforced for company-managed devices only; BYOD policy undefined.",
    risk: "Medium",
    remediationPlan: "Author BYOD policy; deploy MDM to remaining 12% of unmanaged devices.",
    scheduledClose: "2026-08-01",
    status: "In Remediation",
    owner: "T. Kim",
    opened: "2026-03-18"
  },
  {
    id: "POAM-023",
    controlId: "3.2.3",
    weakness: "Insider threat training not delivered in last 12 months.",
    risk: "Low",
    remediationPlan: "Deploy KnowBe4 insider-threat module org-wide; verify completion via LMS.",
    scheduledClose: "2026-06-15",
    status: "In Remediation",
    owner: "K. Iwu",
    opened: "2026-04-22"
  },
  {
    id: "POAM-038",
    controlId: "3.4.1",
    weakness: "Baseline configurations exist but are not version-controlled; CIS Benchmark scans last run 9 months ago.",
    risk: "High",
    remediationPlan: "Roll baselines into git; run CIS Benchmark v3 scan on 10% sample; document drift.",
    scheduledClose: "2026-07-31",
    status: "In Remediation",
    owner: "J. Smith",
    opened: "2026-03-04"
  },
  {
    id: "POAM-045",
    controlId: "3.4.8",
    weakness: "Application allowlist/denylist policy not enforced.",
    risk: "High",
    remediationPlan: "Deploy WDAC policy in audit mode for 30 days, then enforce on CUI endpoints.",
    scheduledClose: "2026-09-12",
    status: "Open",
    owner: "J. Smith",
    opened: "2026-05-01"
  },
  {
    id: "POAM-053",
    controlId: "3.6.3",
    weakness: "Incident response plan exists but has not been tabletop-tested in 18 months.",
    risk: "High",
    remediationPlan: "Schedule and execute IR tabletop with C-suite participation; document findings.",
    scheduledClose: "2026-06-30",
    status: "Pending Review",
    owner: "M. Okafor",
    opened: "2026-04-10"
  },
  {
    id: "POAM-072",
    controlId: "3.11.2",
    weakness: "Vulnerability scans are run ad-hoc rather than monthly with documented SLA.",
    risk: "Medium",
    remediationPlan: "Establish monthly Tenable scan schedule; document closure SLA per severity.",
    scheduledClose: "2026-07-20",
    status: "Pending Review",
    owner: "R. Vasquez",
    opened: "2026-04-15"
  },
  {
    id: "POAM-091",
    controlId: "3.13.11",
    weakness: "FIPS-validated cryptography in use, but evidence not catalogued by data class.",
    risk: "Medium",
    remediationPlan: "Build crypto inventory matrix per CUI data class; cite FIPS module certificates.",
    scheduledClose: "2026-06-01",
    status: "Closed",
    owner: "A. Sterling",
    opened: "2026-02-12",
    comments: "Closed 2026-05-08 — packet ready for C3PAO."
  }
];
