/**
 * Evidence Mapping Matrix
 *
 * Three sheets: Cover, Evidence Master List, Required by Control, Coverage by Family.
 */

import ExcelJS from "exceljs";
import { CONTROLS, FAMILY_NAMES } from "@/data/controls110";
import { familyPosture } from "@/lib/analytics";
import { loadEngagement } from "@/lib/engagement";
import { BRAND, applyWatermark, styleHeaderRow, styleDataRow, writeCoverSheet, isoDate } from "./common";

type SampleEvidence = {
  id: string;
  controlId: string;
  family: string;
  name: string;
  type: string;
  fileName: string;
  system: string;
  owner: string;
  collected: string;
  expires: string;
  status: "Valid" | "Expiring Soon" | "Expired";
  location: string;
  objective: string;
};

const SAMPLE: SampleEvidence[] = [
  { id: "EVD-AC-001", controlId: "3.1.1",  family: "AC", name: "AD Group Membership Export",       type: "Config Export", fileName: "3.1.1_AD-Groups_2026-04-10.pdf",      system: "Active Directory", owner: "J. Smith",   collected: "2026-04-10", expires: "2026-10-10", status: "Valid",          location: "/evidence/AC/3.1.1_AD-Groups_2026-04-10.pdf", objective: "[a] authorized users identified" },
  { id: "EVD-AC-002", controlId: "3.1.1",  family: "AC", name: "MFA Enforcement Policy",            type: "Policy Doc",    fileName: "3.1.1_MFA-Policy_v3.2.pdf",            system: "Azure AD",         owner: "A. Lee",     collected: "2026-03-15", expires: "—",          status: "Valid",          location: "/evidence/AC/3.1.1_MFA-Policy_v3.2.pdf",      objective: "[d] access limited to authorized users" },
  { id: "EVD-AC-012", controlId: "3.1.10", family: "AC", name: "GPO Screen-Lock Settings",          type: "Config Export", fileName: "3.1.10_GPO-ScreenLock_2026-05-14.pdf", system: "Group Policy",     owner: "J. Smith",   collected: "2026-05-14", expires: "2026-11-14", status: "Valid",          location: "/evidence/AC/3.1.10_GPO-ScreenLock_2026-05-14.pdf", objective: "[a] session lock enforced" },
  { id: "EVD-IA-003", controlId: "3.5.3",  family: "IA", name: "VPN MFA Conditional Access",        type: "Config Export", fileName: "3.5.3_VPN-MFA-CA_2026-05-01.pdf",      system: "Azure AD",         owner: "A. Lee",     collected: "2026-05-01", expires: "—",          status: "Valid",          location: "/evidence/IA/3.5.3_VPN-MFA-CA_2026-05-01.pdf", objective: "[a] MFA for network access" },
  { id: "EVD-SC-006", controlId: "3.13.8", family: "SC", name: "Firewall Rule Export (egress)",     type: "Config Export", fileName: "3.13.8_FW-Egress_2026-04-30.pdf",      system: "Palo Alto",        owner: "T. Kim",     collected: "2026-04-30", expires: "2026-10-30", status: "Valid",          location: "/evidence/SC/3.13.8_FW-Egress_2026-04-30.pdf", objective: "[a] crypto in transit" },
  { id: "EVD-SI-005", controlId: "3.14.2", family: "SI", name: "CrowdStrike AV Policy Screenshot",  type: "Screenshot",    fileName: "3.14.2_CS-Policy_2026-04-22.png",      system: "CrowdStrike",      owner: "T. Kim",     collected: "2026-04-22", expires: "2026-10-22", status: "Expiring Soon",  location: "/evidence/SI/3.14.2_CS-Policy_2026-04-22.png", objective: "[a] malicious code protection at entry/exit" },
  { id: "EVD-AU-004", controlId: "3.3.1",  family: "AU", name: "SIEM Audit Policy + 7d sample",     type: "Log Sample",    fileName: "3.3.1_SIEM-Logs_2026-03-01.zip",       system: "Splunk",           owner: "R. Vasquez", collected: "2026-03-01", expires: "2026-05-30", status: "Expiring Soon",  location: "/evidence/AU/3.3.1_SIEM-Logs_2026-03-01.zip", objective: "[a,b] who-did-what-when" },
  { id: "EVD-CM-019", controlId: "3.4.1",  family: "CM", name: "CIS Benchmark scan (10% sample)",   type: "Config Scan",   fileName: "3.4.1_CIS-Scan_2025-08-12.pdf",        system: "Tenable",          owner: "J. Smith",   collected: "2025-08-12", expires: "2026-02-12", status: "Expired",        location: "/evidence/CM/3.4.1_CIS-Scan_2025-08-12.pdf", objective: "[a] baseline established" }
];

const STATUS_FILL: Record<string, string> = {
  Valid: "FFE6F5EC",
  "Expiring Soon": "FFFEF4E6",
  Expired: "FFFCE7E7"
};
const STATUS_FONT: Record<string, string> = {
  Valid: BRAND.green,
  "Expiring Soon": BRAND.amber,
  Expired: BRAND.red
};

export async function buildEvidenceMatrix(): Promise<Buffer> {
  const e = await loadEngagement();
  const wb = new ExcelJS.Workbook();
  wb.creator = "CyberAutopsy GRC Portal";
  wb.created = new Date();

  /* ---------- Cover ---------- */
  const cover = wb.addWorksheet("Cover", { properties: { tabColor: { argb: BRAND.gold } } });
  writeCoverSheet(
    cover,
    "Evidence Mapping Matrix",
    "Artifact → Control → Assessment Objective · C3PAO read order",
    [
      ["Organization", e.organizationLegal],
      ["CAGE code", e.cage],
      ["System boundary", e.systemBoundary],
      ["Reporting period", e.reportingPeriod],
      ["Lead assessor", e.assessor],
      ["Generated", new Date().toLocaleString("en-US", { timeZoneName: "short" })],
      ["Document version", `${e.documentVersion} (${isoDate()})`],
      ["File naming convention", "ControlID_Description_YYYY-MM-DD.ext"],
      ["Classification", e.classification]
    ]
  );

  /* ---------- Evidence Master List ---------- */
  const master = wb.addWorksheet("Evidence Master List");
  master.columns = [
    { header: "Evidence ID",          key: "id",         width: 14 },
    { header: "Control ID",           key: "controlId",  width: 10 },
    { header: "Family",               key: "family",     width: 8  },
    { header: "Evidence Name",        key: "name",       width: 36 },
    { header: "Type",                 key: "type",       width: 16 },
    { header: "File Name",            key: "fileName",   width: 40 },
    { header: "System / Tool",        key: "system",     width: 18 },
    { header: "Owner",                key: "owner",      width: 14 },
    { header: "Collected",            key: "collected",  width: 12 },
    { header: "Expires",              key: "expires",    width: 12 },
    { header: "Status",               key: "status",     width: 14 },
    { header: "Location",             key: "location",   width: 50 },
    { header: "Assessment Objective", key: "objective",  width: 36 }
  ];

  SAMPLE.forEach((e) => master.addRow(e));

  styleHeaderRow(master, 1);
  master.views = [{ state: "frozen", ySplit: 1, xSplit: 1 }];

  for (let i = 2; i <= SAMPLE.length + 1; i++) {
    styleDataRow(master, i);
    master.getRow(i).height = 32;

    const status = master.getCell(i, 11).value as string;
    if (status) {
      master.getCell(i, 11).fill = { type: "pattern", pattern: "solid", fgColor: { argb: STATUS_FILL[status] } };
      master.getCell(i, 11).font = { name: "Calibri", size: 9, bold: true, color: { argb: STATUS_FONT[status] } };
      master.getCell(i, 11).alignment = { vertical: "middle", horizontal: "center" };
    }
  }

  /* ---------- Required by Control ---------- */
  const required = wb.addWorksheet("Required by Control");
  required.columns = [
    { header: "Control ID",       key: "id",       width: 10 },
    { header: "Family",           key: "family",   width: 8  },
    { header: "Control Name",     key: "name",     width: 32 },
    { header: "Weight",           key: "weight",   width: 8  },
    { header: "Required Evidence Types", key: "types", width: 32 },
    { header: "Acceptable Artifacts",    key: "artifacts", width: 60 },
    { header: "Collection Frequency",    key: "freq", width: 16 }
  ];

  CONTROLS.forEach((c) => {
    required.addRow({
      id: c.id,
      family: c.family,
      name: c.name,
      weight: c.weight,
      types: requiredEvidenceTypes(c.family),
      artifacts: acceptableArtifacts(c.family),
      freq: collectionFrequency(c.weight)
    });
  });

  styleHeaderRow(required, 1);
  required.views = [{ state: "frozen", ySplit: 1, xSplit: 1 }];
  for (let i = 2; i <= CONTROLS.length + 1; i++) {
    styleDataRow(required, i);
    required.getRow(i).height = 28;
  }

  /* ---------- Coverage by Family ---------- */
  const coverage = wb.addWorksheet("Coverage by Family", { properties: { tabColor: { argb: BRAND.gold } } });
  coverage.columns = [
    { header: "Family",                       key: "family",        width: 8  },
    { header: "Family Name",                  key: "name",          width: 32 },
    { header: "Total Controls",               key: "total",         width: 14 },
    { header: "Implemented",                  key: "impl",          width: 14 },
    { header: "Coverage %",                   key: "pct",           width: 14 },
    { header: "Evidence Artifacts (in matrix)", key: "artifacts",   width: 22 }
  ];

  const posture = familyPosture(CONTROLS);
  const evidByFamily = new Map<string, number>();
  SAMPLE.forEach((e) => evidByFamily.set(e.family, (evidByFamily.get(e.family) ?? 0) + 1));

  for (const [code, p] of posture.entries()) {
    coverage.addRow({
      family: code,
      name: FAMILY_NAMES[code],
      total: p.total,
      impl: p.impl,
      pct: `${Math.round((p.impl / p.total) * 100)}%`,
      artifacts: evidByFamily.get(code) ?? 0
    });
  }

  styleHeaderRow(coverage, 1);
  for (let i = 2; i <= coverage.rowCount; i++) {
    styleDataRow(coverage, i);
  }

  applyWatermark(wb, {
    docTitle: "Evidence Mapping Matrix",
    classification: e.classification
  });

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/* Domain knowledge helpers */

function requiredEvidenceTypes(family: string): string {
  const m: Record<string, string> = {
    AC: "Config Export, Policy Doc",
    AT: "Training Records, LMS Export",
    AU: "Config Export, Log Sample",
    CA: "SSP, Continuous Monitoring Strategy",
    CM: "Inventory, Config Scan",
    IA: "Config Export, Test Evidence",
    IR: "Plan Doc, Tabletop Records",
    MA: "Vendor Logs, Access Tickets",
    MP: "Policy Doc, Sanitization Log",
    PE: "Visitor Log, Camera Retention",
    PS: "Screening Records, Termination Checklists",
    RA: "Scan Reports, Risk Register",
    SC: "Network Diagram, Crypto Module Cert",
    SI: "Patch SLA, Telemetry Sample"
  };
  return m[family] ?? "Various";
}

function acceptableArtifacts(family: string): string {
  const m: Record<string, string> = {
    AC: "AD group export, access control policy, user audit list",
    AT: "LMS completion records, training content, role-mapping doc",
    AU: "SIEM audit policy, 7+ days of logs showing user/timestamp/action",
    CA: "Signed SSP, continuous monitoring strategy memo",
    CM: "Asset inventory, CIS Benchmark scan, baseline doc",
    IA: "MFA policy, VPN config, login screenshot demonstrating MFA",
    IR: "Incident response plan, tabletop exercise records, after-action report",
    MA: "Maintenance access logs, vendor agreements, ticket records",
    MP: "Media protection policy, sanitization records, marking samples",
    PE: "Visitor log samples, camera retention attestation, after-hours log",
    PS: "Screening attestation records, termination checklists",
    RA: "Vulnerability scan reports, risk register, remediation SLAs",
    SC: "Boundary diagram, FIPS module certificate references, encryption inventory",
    SI: "Patch SLAs, malicious-code telemetry, scan cadence records"
  };
  return m[family] ?? "—";
}

function collectionFrequency(weight: number): string {
  if (weight === 5) return "Quarterly + on change";
  if (weight === 3) return "Semi-annual";
  return "Annual";
}
