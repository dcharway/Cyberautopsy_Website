/**
 * CMMC Assessment Checklist — admin-only export, PRD §6.4 / §14 first release.
 *
 * Five sheets:
 *   Cover        — engagement metadata
 *   Checklist    — 110 controls, one row each, assessor verdict + notes
 *   By Family    — 14-family rollup for the assessor's sign-off
 *   Findings     — open + remediated findings (free-form rows)
 *   Sign-off     — assessor + senior official attestation lines
 */

import ExcelJS from "exceljs";
import { CONTROLS, FAMILY_NAMES } from "@/data/controls110";
import { familyPosture, sprsScore } from "@/lib/analytics";
import { loadEngagement } from "@/lib/engagement";
import {
  BRAND,
  applyStatusCellStyle,
  applyWatermark,
  styleHeaderRow,
  styleDataRow,
  writeCoverSheet
} from "./common";

export async function buildAssessmentChecklist(): Promise<Buffer> {
  const e = await loadEngagement();
  const wb = new ExcelJS.Workbook();
  wb.creator = "CyberAutopsy GRC Portal";
  wb.created = new Date();

  /* ----- Cover ----- */
  const cover = wb.addWorksheet("Cover", { properties: { tabColor: { argb: BRAND.gold } } });
  writeCoverSheet(
    cover,
    "CMMC Assessment Checklist",
    "NIST SP 800-171 Rev. 2 · 110 controls · Assessor walkthrough workbook",
    [
      ["Organization", e.organizationLegal],
      ["CAGE code", e.cage],
      ["System boundary", e.systemBoundary],
      ["RPO firm", e.rpoFirm],
      ["C3PAO of record", e.c3paoFirm],
      ["Lead assessor", e.assessor],
      ["Engagement start", e.engagementStart],
      ["Audit-ready target", e.scheduledClose],
      ["Reporting period", e.reportingPeriod],
      ["Document version", e.documentVersion],
      ["Classification", e.classification],
      ["Generated", new Date().toLocaleString("en-US", { timeZoneName: "short" })]
    ]
  );

  /* ----- Checklist ----- */
  const ws = wb.addWorksheet("Checklist");
  ws.columns = [
    { header: "Control ID",        key: "id",         width: 10 },
    { header: "Family",            key: "family",     width: 8  },
    { header: "Control name",      key: "name",       width: 32 },
    { header: "Requirement",       key: "requirement",width: 56 },
    { header: "Weight",            key: "weight",     width: 8  },
    { header: "Current status",    key: "status",     width: 16 },
    { header: "Assessor verdict",  key: "verdict",    width: 18 },
    { header: "Evidence ref",      key: "evidence",   width: 18 },
    { header: "Assessor notes",    key: "notes",      width: 36 },
    { header: "Date reviewed",     key: "reviewed",   width: 14 },
    { header: "Reviewer",          key: "reviewer",   width: 14 }
  ];

  CONTROLS.forEach((c) =>
    ws.addRow({
      id: c.id,
      family: c.family,
      name: c.name,
      requirement: c.requirement,
      weight: c.weight,
      status: c.status,
      verdict: "",
      evidence: c.evidenceIds.join(", ") || "",
      notes: "",
      reviewed: "",
      reviewer: ""
    })
  );

  styleHeaderRow(ws, 1);
  ws.views = [{ state: "frozen", ySplit: 1, xSplit: 2 }];

  for (let i = 2; i <= CONTROLS.length + 1; i++) {
    styleDataRow(ws, i);
    ws.getRow(i).height = 36;
    const status = ws.getCell(i, 6).value as string;
    applyStatusCellStyle(ws, i, 6, status);
  }

  // Assessor verdict dropdown — runtime API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ws as any).dataValidations.add(`G2:G${CONTROLS.length + 1}`, {
    type: "list",
    allowBlank: true,
    formulae: ['"Met,Met with notes,POA&M,Not Met,Not Applicable"']
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ws as any).dataValidations.add(`F2:F${CONTROLS.length + 1}`, {
    type: "list",
    allowBlank: false,
    formulae: ['"Implemented,Partial,Not Implemented,Not Applicable,Not Started,Under Review"']
  });

  /* ----- By Family ----- */
  const fam = wb.addWorksheet("By Family", { properties: { tabColor: { argb: BRAND.gold } } });
  fam.columns = [
    { header: "Family",        key: "family",     width: 8 },
    { header: "Family name",   key: "name",       width: 36 },
    { header: "Total controls",key: "total",      width: 14 },
    { header: "Implemented",   key: "impl",       width: 14 },
    { header: "Partial",       key: "partial",    width: 12 },
    { header: "Missing",       key: "missing",    width: 12 },
    { header: "Coverage %",    key: "pct",        width: 14 },
    { header: "Assessor sign-off (date)",  key: "signoff",  width: 22 }
  ];
  for (const [code, p] of familyPosture(CONTROLS).entries()) {
    fam.addRow({
      family: code,
      name: FAMILY_NAMES[code],
      total: p.total,
      impl: p.impl,
      partial: p.partial,
      missing: p.missing,
      pct: `${Math.round((p.impl / p.total) * 100)}%`,
      signoff: ""
    });
  }
  styleHeaderRow(fam, 1);
  for (let i = 2; i <= fam.rowCount; i++) styleDataRow(fam, i);

  /* ----- Findings ----- */
  const findings = wb.addWorksheet("Findings");
  findings.columns = [
    { header: "Finding ID", key: "id",         width: 12 },
    { header: "Control",    key: "control",    width: 12 },
    { header: "Severity",   key: "severity",   width: 12 },
    { header: "Description",key: "description",width: 60 },
    { header: "Status",     key: "status",     width: 14 },
    { header: "Owner",      key: "owner",      width: 14 },
    { header: "Target date",key: "target",     width: 14 }
  ];
  // Seed with two example rows so the assessor sees the schema
  findings.addRow({
    id: "F-001", control: "3.4.1", severity: "Medium",
    description: "Baseline configurations are claimed but not version-controlled in git.",
    status: "Open", owner: "J. Smith", target: "2026-07-15"
  });
  findings.addRow({
    id: "F-002", control: "3.6.3", severity: "High",
    description: "Incident response plan has not been tabletop-tested in 18 months.",
    status: "Open", owner: "M. Okafor", target: "2026-06-30"
  });
  styleHeaderRow(findings, 1);
  for (let i = 2; i <= findings.rowCount; i++) styleDataRow(findings, i);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (findings as any).dataValidations.add(`C2:C100`, {
    type: "list", allowBlank: true,
    formulae: ['"Low,Medium,High"']
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (findings as any).dataValidations.add(`E2:E100`, {
    type: "list", allowBlank: true,
    formulae: ['"Open,In Remediation,Verified,Closed"']
  });

  /* ----- Sign-off ----- */
  const signoff = wb.addWorksheet("Sign-off", { properties: { tabColor: { argb: BRAND.gold } } });
  signoff.columns = [{ width: 28 }, { width: 50 }];
  const score = sprsScore(CONTROLS);

  signoff.addRow(["ASSESSMENT SIGN-OFF", ""]);
  styleHeaderRow(signoff, 1);

  const rows: Array<[string, string]> = [
    ["", ""],
    ["Organization", e.organizationLegal],
    ["CAGE code", e.cage],
    ["System boundary", e.systemBoundary],
    ["Reporting period", e.reportingPeriod],
    ["", ""],
    ["Computed SPRS score", `${score} / 110 (threshold 88 — ${score >= 88 ? "PASS" : "FAIL"})`],
    ["Controls reviewed", `${CONTROLS.length} / 110`],
    ["", ""],
    ["Lead assessor (printed name)", e.assessor],
    ["Lead assessor signature", ""],
    ["Date", ""],
    ["", ""],
    ["Senior official (printed name)", e.affirmingOfficial],
    ["Senior official title", e.affirmingOfficialTitle],
    ["Senior official signature", ""],
    ["Date", ""],
    ["", ""],
    [
      "Attestation",
      "I attest that this assessment was conducted in accordance with NIST SP 800-171A " +
        "assessment procedures and that the findings recorded herein reflect the system " +
        "posture observed during the reporting period above."
    ]
  ];
  for (const [k, v] of rows) {
    const r = signoff.addRow([k, v]);
    if (k) r.getCell(1).font = { name: "Calibri", size: 9, bold: true, color: { argb: BRAND.bone400 } };
    r.getCell(2).alignment = { vertical: "middle", wrapText: true };
    r.height = k.toLowerCase().includes("signature") ? 30 : 18;
  }

  /* ----- Apply watermark to every sheet ----- */
  applyWatermark(wb, {
    docTitle: "CMMC Assessment Checklist",
    classification: e.classification
  });

  return Buffer.from(await wb.xlsx.writeBuffer());
}
