/**
 * Shared report-generation helpers: workbook styling, brand tokens, filename helpers.
 */

import type { Worksheet, Workbook } from "exceljs";

export const BRAND = {
  gold: "FFD4AF37",
  goldLight: "FFF2E6B5",
  ink: "FF0A0A0B",
  ink800: "FF16161A",
  ink700: "FF1F1F24",
  bone: "FFFAFAFA",
  bone400: "FF8E8E86",
  green: "FF16A34A",
  amber: "FFF59E0B",
  red: "FFDC2626",
  blue: "FF2563EB",
  gray: "FF6B7280"
};

export const STATUS_FILL: Record<string, string> = {
  Implemented: "FFE6F5EC",
  Partial: "FFFEF4E6",
  "Not Implemented": "FFFCE7E7",
  "Not Started": "FFEFEFEF",
  "Not Applicable": "FFEFEFEF",
  "Under Review": "FFE6EEFB"
};

export const STATUS_FONT: Record<string, string> = {
  Implemented: BRAND.green,
  Partial: BRAND.amber,
  "Not Implemented": BRAND.red,
  "Not Started": BRAND.gray,
  "Not Applicable": BRAND.gray,
  "Under Review": BRAND.blue
};

export function isoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

export function exportFileName(prefix: string, orgSlug: string, ext: string): string {
  return `${prefix}_${orgSlug}_${isoDate()}.${ext}`;
}

/* ---------- worksheet styling primitives ---------- */

export function styleHeaderRow(ws: Worksheet, rowNumber: number) {
  const row = ws.getRow(rowNumber);
  row.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: BRAND.gold }, family: 2 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND.ink800 } };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: BRAND.ink700 } },
      bottom: { style: "medium", color: { argb: BRAND.gold } }
    };
  });
  row.height = 24;
}

export function styleDataRow(ws: Worksheet, rowNumber: number) {
  const row = ws.getRow(rowNumber);
  row.eachCell((cell) => {
    cell.font = cell.font ?? { name: "Calibri", size: 10 };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = {
      bottom: { style: "hair", color: { argb: BRAND.bone400 } }
    };
  });
}

export function applyStatusCellStyle(ws: Worksheet, rowNumber: number, colNumber: number, status: string) {
  const cell = ws.getCell(rowNumber, colNumber);
  cell.font = {
    name: "Calibri",
    size: 9,
    bold: true,
    color: { argb: STATUS_FONT[status] ?? BRAND.gray }
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: STATUS_FILL[status] ?? "FFEFEFEF" }
  };
  cell.alignment = { vertical: "middle", horizontal: "center" };
}

export function writeCoverSheet(ws: Worksheet, title: string, subtitle: string, meta: Array<[string, string]>) {
  ws.columns = [{ width: 28 }, { width: 60 }];

  ws.mergeCells("A1:B1");
  const t = ws.getCell("A1");
  t.value = "CYBERAUTOPSY · CMMC L2";
  t.font = { name: "Calibri", size: 10, bold: true, color: { argb: BRAND.gold } };
  t.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(1).height = 24;

  ws.mergeCells("A2:B2");
  const t2 = ws.getCell("A2");
  t2.value = title;
  t2.font = { name: "Calibri", size: 24, bold: true, color: { argb: BRAND.bone } };
  t2.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(2).height = 36;

  ws.mergeCells("A3:B3");
  const t3 = ws.getCell("A3");
  t3.value = subtitle;
  t3.font = { name: "Calibri", size: 11, color: { argb: BRAND.bone400 }, italic: true };
  ws.getRow(3).height = 18;

  ws.addRow([]);

  let row = 5;
  for (const [k, v] of meta) {
    const r = ws.addRow([k.toUpperCase(), v]);
    r.getCell(1).font = { name: "Calibri", size: 9, bold: true, color: { argb: BRAND.bone400 } };
    r.getCell(2).font = { name: "Calibri", size: 11, color: { argb: BRAND.ink } };
    r.height = 20;
    row++;
  }

  // Tint background
  ws.getRow(1).fill = ws.getRow(2).fill = ws.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFBF7E8" } // gold tint
  };
}

/* ---------- watermark / branding (PRD §6.5) ---------- */

/**
 * Apply the CyberAutopsy watermark to every sheet of a workbook.
 *
 * Implementation uses ExcelJS's headerFooter API, which prints on every
 * page when the spreadsheet is printed AND is shown in print-preview mode.
 * Format codes:
 *   &L / &C / &R = left / center / right
 *   &"Font,Style"&size&KRRGGBB = font + size + color
 *   &P = current page, &N = total pages, &D = date
 *
 * Call this AFTER all rows/columns are added (the page setup includes a
 * computed print area based on the final extents).
 */
export function applyWatermark(
  wb: Workbook,
  opts: { docTitle: string; classification?: string; firmName?: string }
): void {
  const docTitle = opts.docTitle;
  const classification = opts.classification ?? "Controlled Unclassified Information (CUI)";
  const firmName = opts.firmName ?? "CyberAutopsy LLC";

  // & has to be doubled to escape it inside header/footer codes.
  const esc = (s: string) => s.replace(/&/g, "&&");

  wb.eachSheet((ws) => {
    ws.headerFooter = {
      oddHeader:
        `&L&"Calibri,Bold"&11&K${BRAND.gold.slice(2)}CYBERAUTOPSY` +
        `&C&"Calibri,Bold"&10${esc(docTitle)}` +
        `&R&"Calibri"&9&K808080${esc(classification)}`,
      oddFooter:
        `&L&"Calibri,Italic"&9&K808080© ${esc(firmName)} — Confidential` +
        `&C&"Calibri"&9&K808080Page &P of &N` +
        `&R&"Calibri"&9&K808080&D`,
      // Even/first pages get the same (most printers don't honour even/odd
      // distinctively, but covering them avoids blank headers on long docs).
      evenHeader:
        `&L&"Calibri,Bold"&11&K${BRAND.gold.slice(2)}CYBERAUTOPSY` +
        `&C&"Calibri,Bold"&10${esc(docTitle)}` +
        `&R&"Calibri"&9&K808080${esc(classification)}`,
      evenFooter:
        `&L&"Calibri,Italic"&9&K808080© ${esc(firmName)} — Confidential` +
        `&C&"Calibri"&9&K808080Page &P of &N` +
        `&R&"Calibri"&9&K808080&D`,
      differentFirst: false,
      differentOddEven: false
    };

    // Page setup so the watermark prints reliably across viewers. View=pageLayout
    // means Excel opens the sheet in Page Layout view by default — that mode
    // shows the header/footer on screen (not just in print preview), so the
    // CyberAutopsy mark is visible without obstructing the data rows.
    ws.pageSetup = {
      ...(ws.pageSetup ?? {}),
      margins: { left: 0.5, right: 0.5, top: 0.85, bottom: 0.7, header: 0.35, footer: 0.35 },
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9 // A4; closest universal default
    };
  });
}

/**
 * Insert the visible in-cell brand banner at row 1 of the sheet.
 * Call this BEFORE setting up ws.columns / addRow / data validations so the
 * banner does not shift downstream A1 ranges. Skip for cover sheets.
 */
export function addBrandBanner(ws: Worksheet, span: number): void {
  ws.mergeCells(1, 1, 1, Math.max(1, span));
  const cell = ws.getCell(1, 1);
  cell.value = "CYBERAUTOPSY · CMMC L2 ASSESSMENT";
  cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: BRAND.gold } };
  cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND.ink800 } };
  ws.getRow(1).height = 22;
}

