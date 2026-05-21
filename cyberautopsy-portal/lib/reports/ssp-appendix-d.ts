/**
 * SSP Appendix D — Control Summary
 *
 * Three sheets: Cover, Control Summary (all 110 controls), Statistics.
 * Mirrors the artifact a C3PAO reads first.
 */

import ExcelJS from "exceljs";
import { CONTROLS, FAMILY_NAMES } from "@/data/controls110";
import { countByStatus, sprsScore, familyPosture } from "@/lib/analytics";
import { ORG } from "@/lib/utils";
import {
  BRAND,
  applyStatusCellStyle,
  styleHeaderRow,
  styleDataRow,
  writeCoverSheet,
  isoDate
} from "./common";

export async function buildSSPAppendixD(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "CyberAutopsy GRC Portal";
  wb.created = new Date();
  wb.properties.date1904 = false;

  /* ---------- Cover ---------- */
  const cover = wb.addWorksheet("Cover", {
    properties: { tabColor: { argb: BRAND.gold } }
  });
  writeCoverSheet(
    cover,
    "SSP Appendix D — Control Summary",
    "NIST SP 800-171 Rev. 2 · CMMC Level 2 · 110 controls",
    [
      ["Organization", ORG.name],
      ["CAGE code", ORG.cage],
      ["System boundary", ORG.systemBoundary],
      ["Active assessment", ORG.activeAssessment],
      ["C3PAO of record", ORG.c3pao],
      ["Generated", new Date().toLocaleString("en-US", { timeZoneName: "short" })],
      ["Document version", `v1.0 (${isoDate()})`],
      ["Classification", "Controlled Unclassified Information (CUI)"]
    ]
  );

  /* ---------- Control Summary ---------- */
  const ws = wb.addWorksheet("Control Summary");
  ws.columns = [
    { header: "Control ID",          key: "id",          width: 10 },
    { header: "Family",              key: "family",      width: 8  },
    { header: "Family Name",         key: "familyName",  width: 28 },
    { header: "Control Name",        key: "name",        width: 32 },
    { header: "Requirement",         key: "requirement", width: 60 },
    { header: "Weight",              key: "weight",      width: 8  },
    { header: "Status",              key: "status",      width: 16 },
    { header: "SSP Section",         key: "sspSection",  width: 12 },
    { header: "Owner",               key: "owner",       width: 14 },
    { header: "Last Reviewed",       key: "lastReviewed",width: 14 },
    { header: "Evidence Artifacts",  key: "evidence",    width: 22 },
    { header: "POA&M ID",            key: "poamId",      width: 12 },
    { header: "Narrative",           key: "narrative",   width: 50 }
  ];

  CONTROLS.forEach((c) => {
    ws.addRow({
      id: c.id,
      family: c.family,
      familyName: c.familyName,
      name: c.name,
      requirement: c.requirement,
      weight: c.weight,
      status: c.status,
      sspSection: c.sspSection,
      owner: c.owner ?? "—",
      lastReviewed: c.lastReviewed ?? "—",
      evidence: c.evidenceIds.join(", ") || "—",
      poamId: c.poamId ?? "—",
      narrative: c.narrative ?? ""
    });
  });

  // Styling
  styleHeaderRow(ws, 1);
  ws.views = [{ state: "frozen", ySplit: 1, xSplit: 1 }];

  // Per-row styling + conditional fill on Status column
  for (let i = 2; i <= CONTROLS.length + 1; i++) {
    styleDataRow(ws, i);
    const status = (ws.getCell(i, 7).value as string) ?? "";
    applyStatusCellStyle(ws, i, 7, status);
    ws.getRow(i).height = 32;
  }

  // Data validation on Status column (column 7) — runtime API, missing from exceljs d.ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ws as any).dataValidations.add(`G2:G${CONTROLS.length + 1}`, {
    type: "list",
    allowBlank: false,
    formulae: ['"Implemented,Partial,Not Implemented,Not Applicable,Not Started,Under Review"']
  });

  /* ---------- Statistics ---------- */
  const stats = wb.addWorksheet("Statistics", { properties: { tabColor: { argb: BRAND.gold } } });
  stats.columns = [{ width: 32 }, { width: 14 }, { width: 14 }];

  // Section: SPRS
  stats.addRow(["SPRS SCORE", "", ""]);
  styleHeaderRow(stats, 1);
  stats.addRow(["Computed SPRS Score", sprsScore(CONTROLS), "/ 110"]);
  stats.addRow(["CMMC 2.0 Threshold", 88, ""]);
  stats.addRow(["Pass / Fail", sprsScore(CONTROLS) >= 88 ? "PASS" : "FAIL", ""]);

  stats.addRow([]);

  // Section: by status
  const headerRow = stats.addRow(["BY IMPLEMENTATION STATUS", "Count", "% of 110"]);
  styleHeaderRow(stats, headerRow.number);
  const counts = countByStatus(CONTROLS);
  for (const [status, n] of Object.entries(counts)) {
    const r = stats.addRow([status, n, `${((n / CONTROLS.length) * 100).toFixed(1)}%`]);
    applyStatusCellStyle(stats, r.number, 1, status);
  }

  stats.addRow([]);

  // Section: by family
  const familyHeader = stats.addRow(["BY FAMILY", "Implemented", "Of total"]);
  styleHeaderRow(stats, familyHeader.number);
  const posture = familyPosture(CONTROLS);
  for (const [code, p] of posture.entries()) {
    stats.addRow([`${code} · ${FAMILY_NAMES[code]}`, p.impl, p.total]);
  }

  return Buffer.from(await wb.xlsx.writeBuffer());
}
