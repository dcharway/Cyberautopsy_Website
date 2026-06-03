/**
 * Annual Affirmation Statement — admin-only export, PRD §6.4 / §14 first release.
 *
 * One workbook with a single attestation page formatted so it prints cleanly
 * onto one page (assessor + senior officer signature blocks, attestation
 * paragraph, SPRS score, date of last affirmation, date of next affirmation
 * due, CAGE code, system boundary).
 *
 * The PRD calls out this document specifically as required for the first
 * release alongside the Checklist.
 */

import ExcelJS from "exceljs";
import { CONTROLS } from "@/data/controls110";
import { sprsScore } from "@/lib/analytics";
import { loadEngagement } from "@/lib/engagement";
import {
  BRAND,
  applyWatermark,
  writeCoverSheet
} from "./common";

export async function buildAffirmationStatement(): Promise<Buffer> {
  const e = await loadEngagement();
  const score = sprsScore(CONTROLS);

  const wb = new ExcelJS.Workbook();
  wb.creator = "CyberAutopsy GRC Portal";
  wb.created = new Date();

  /* ----- Cover ----- */
  const cover = wb.addWorksheet("Cover", { properties: { tabColor: { argb: BRAND.gold } } });
  writeCoverSheet(
    cover,
    "Annual Affirmation Statement",
    "CMMC §170.22 affirmation of continuing compliance",
    [
      ["Organization", e.organizationLegal],
      ["CAGE code", e.cage],
      ["System boundary", e.systemBoundary],
      ["Affirming official", e.affirmingOfficial],
      ["Title", e.affirmingOfficialTitle],
      ["Last affirmation", e.lastAffirmation ?? "—"],
      ["Next affirmation due", e.nextAffirmationDue],
      ["Reporting period", e.reportingPeriod],
      ["Document version", e.documentVersion],
      ["Classification", e.classification],
      ["Generated", new Date().toLocaleString("en-US", { timeZoneName: "short" })]
    ]
  );

  /* ----- Affirmation Statement ----- */
  const ws = wb.addWorksheet("Affirmation", {
    properties: { tabColor: { argb: BRAND.gold } },
    pageSetup: { orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 1 }
  });
  ws.columns = [{ width: 28 }, { width: 70 }];

  // Title row
  ws.mergeCells("A1:B1");
  const title = ws.getCell("A1");
  title.value = "ANNUAL AFFIRMATION OF CONTINUING COMPLIANCE";
  title.font = { name: "Calibri", size: 16, bold: true, color: { argb: BRAND.bone } };
  title.alignment = { vertical: "middle", horizontal: "center" };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND.ink800 } };
  ws.getRow(1).height = 32;

  ws.mergeCells("A2:B2");
  const sub = ws.getCell("A2");
  sub.value = "Pursuant to 32 CFR §170.22 (Affirmation of Compliance with CMMC Security Requirements)";
  sub.font = { name: "Calibri", size: 10, italic: true, color: { argb: BRAND.bone400 } };
  sub.alignment = { vertical: "middle", horizontal: "center" };
  ws.getRow(2).height = 18;

  ws.addRow([]);

  // Organization block
  const orgRows: Array<[string, string]> = [
    ["Organization (legal)", e.organizationLegal],
    ["CAGE code", e.cage],
    ["DUNS", e.ducns ?? "—"],
    ["System boundary", e.systemBoundary],
    ["CMMC certification level", "Level 2 — NIST SP 800-171 Rev. 2"],
    ["Reporting period", e.reportingPeriod],
    ["SPRS score (computed)", `${score} of 110 (threshold 88 — ${score >= 88 ? "MEETS" : "DOES NOT MEET"})`]
  ];
  for (const [k, v] of orgRows) {
    const r = ws.addRow([k.toUpperCase(), v]);
    r.getCell(1).font = { name: "Calibri", size: 9, bold: true, color: { argb: BRAND.bone400 } };
    r.getCell(2).font = { name: "Calibri", size: 11, color: { argb: BRAND.ink } };
    r.height = 22;
  }

  ws.addRow([]);

  // Attestation paragraph
  const attRow = ws.addRow([
    "ATTESTATION",
    `I, ${e.affirmingOfficial}, in my capacity as ${e.affirmingOfficialTitle} of ` +
      `${e.organizationLegal} (the "Organization"), hereby affirm under penalty of ` +
      `perjury that as of the date written below the Organization continues to ` +
      `implement all NIST SP 800-171 Rev. 2 security requirements within the system ` +
      `boundary identified above to the level documented in the System Security Plan ` +
      `of record. Any deviations from full implementation are tracked in the ` +
      `accompanying Plan of Action and Milestones (POA&M) with documented remediation ` +
      `dates. The Organization will notify the Government within thirty (30) days of ` +
      `any material change to this affirmation.`
  ]);
  attRow.getCell(1).font = { name: "Calibri", size: 9, bold: true, color: { argb: BRAND.bone400 } };
  attRow.getCell(2).font = { name: "Calibri", size: 11, color: { argb: BRAND.ink } };
  attRow.getCell(2).alignment = { vertical: "top", wrapText: true };
  attRow.height = 140;

  ws.addRow([]);

  // Affirming-official signature block
  const sig: Array<[string, string]> = [
    ["Affirming senior official (printed)", e.affirmingOfficial],
    ["Title", e.affirmingOfficialTitle],
    ["Email", e.affirmingOfficialEmail ?? "—"],
    ["Signature", ""],
    ["Date signed", ""]
  ];
  for (const [k, v] of sig) {
    const r = ws.addRow([k.toUpperCase(), v]);
    r.getCell(1).font = { name: "Calibri", size: 9, bold: true, color: { argb: BRAND.bone400 } };
    r.getCell(2).font = { name: "Calibri", size: 11, color: { argb: BRAND.ink } };
    r.getCell(2).border = {
      bottom: { style: "thin", color: { argb: BRAND.ink } }
    };
    r.height = k.toLowerCase().includes("signature") ? 36 : 22;
  }

  ws.addRow([]);

  // RPO countersignature block
  const rpo: Array<[string, string]> = [
    ["RPO firm", e.rpoFirm],
    ["Lead assessor (printed)", e.assessor],
    ["Assessor signature", ""],
    ["Date signed", ""]
  ];
  for (const [k, v] of rpo) {
    const r = ws.addRow([k.toUpperCase(), v]);
    r.getCell(1).font = { name: "Calibri", size: 9, bold: true, color: { argb: BRAND.bone400 } };
    r.getCell(2).font = { name: "Calibri", size: 11, color: { argb: BRAND.ink } };
    r.getCell(2).border = {
      bottom: { style: "thin", color: { argb: BRAND.ink } }
    };
    r.height = k.toLowerCase().includes("signature") ? 36 : 22;
  }

  ws.addRow([]);

  // Footer dates
  const dueRow = ws.addRow([
    "NEXT AFFIRMATION DUE",
    `${e.nextAffirmationDue} — calendared by CyberAutopsy GRC portal. Automated reminder will fire 60 days prior.`
  ]);
  dueRow.getCell(1).font = { name: "Calibri", size: 9, bold: true, color: { argb: BRAND.gold } };
  dueRow.getCell(2).font = { name: "Calibri", size: 11, bold: true, color: { argb: BRAND.ink } };
  dueRow.height = 24;

  /* ----- Apply watermark ----- */
  applyWatermark(wb, {
    docTitle: "Annual Affirmation Statement",
    classification: e.classification
  });

  return Buffer.from(await wb.xlsx.writeBuffer());
}
