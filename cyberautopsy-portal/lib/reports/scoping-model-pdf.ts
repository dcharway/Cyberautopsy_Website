/**
 * Scoping Model — printable PDF export.
 *
 * Letter portrait. Page 1: header, verdict banner, summary matrix. Page 2+:
 * one section per kind (Applications / Technology / People) with every item
 * listed with its scope classification and rationale.
 */

import PDFDocument from "pdfkit";
import {
  CATEGORY_META,
  KIND_META,
  summarize,
  type ScopeCategory,
  type ScopeItem,
  type ScopeKind
} from "@/data/scoping-model";
import type { ScopingState } from "@/lib/scoping-store";
import type { Engagement } from "@/lib/engagement";

const GOLD = "#D4AF37";
const INK = "#0A0A0B";
const INK_SOFT = "#2A2A2E";
const BONE = "#FAFAFA";
const BONE_SOFT = "#6E6E66";
const STATUS_OK = "#16A34A";
const STATUS_WARN = "#F59E0B";
const STATUS_BAD = "#DC2626";
const STATUS_INFO = "#2563EB";

const FONT_REG = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";
const FONT_OBL = "Helvetica-Oblique";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;

function toneColor(t: string): string {
  switch (t) {
    case "critical": return STATUS_BAD;
    case "high": return STATUS_WARN;
    case "medium": return STATUS_INFO;
    case "low": return GOLD;
    default: return STATUS_OK;
  }
}

export async function buildScopingModelPDF(
  state: ScopingState,
  engagement: Engagement
): Promise<Buffer> {
  const summary = summarize(state.items);
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        info: {
          Title: `Scoping Model — ${engagement.organization}`,
          Author: "CyberAutopsy GRC Portal",
          Subject: "FCI / CUI Scoping — application, technology, people",
          Keywords: "CMMC, NIST 800-171, Scoping Guide, CUI, FCI, boundary"
        }
      });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      drawHeaderBand(doc, engagement);
      drawTitle(doc, engagement, state);
      drawVerdictBanner(doc, summary);
      drawCategoryMatrix(doc, summary);
      drawNotes(doc, state);
      drawSignatureBlock(doc, state);
      drawPageFooter(doc, engagement);

      for (const kind of ["application", "technology", "people"] as ScopeKind[]) {
        const items = state.items.filter((i) => i.kind === kind);
        if (items.length === 0) continue;
        doc.addPage();
        drawHeaderBand(doc, engagement);
        drawKindSection(doc, kind, items, engagement);
        drawPageFooter(doc, engagement);
      }

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

/* ---------- sections ---------- */

function drawHeaderBand(doc: PDFKit.PDFDocument, engagement: Engagement) {
  doc.save();
  doc.rect(0, 0, PAGE_W, 44).fill(INK);
  doc.rect(0, 44, PAGE_W, 2).fill(GOLD);
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(11);
  doc.text("CYBERAUTOPSY", MARGIN, 15, { characterSpacing: 2.5 });
  doc.fillColor(BONE).font(FONT_REG).fontSize(8);
  doc.text(
    `${engagement.classification}  ·  ${engagement.organization}`,
    MARGIN,
    15,
    { width: CONTENT_W, align: "right" }
  );
  doc.restore();
}

function drawTitle(doc: PDFKit.PDFDocument, engagement: Engagement, state: ScopingState) {
  const y = 60;
  doc.fillColor(BONE_SOFT).font(FONT_BOLD).fontSize(8);
  doc.text("FCI / CUI SCOPING MODEL", MARGIN, y, { characterSpacing: 1.5 });
  doc.fillColor(INK).font(FONT_BOLD).fontSize(20);
  doc.text("Assessment boundary — applications, technology, and people in scope", MARGIN, y + 12, {
    width: CONTENT_W
  });
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(9);
  doc.text(
    `${engagement.organizationLegal}  ·  CAGE ${engagement.cage}  ·  ${engagement.reportingPeriod}  ·  ${state.items.length} inventoried assets  ·  Prepared ${state.updatedAt.slice(0, 10)}`,
    MARGIN,
    y + 44,
    { width: CONTENT_W }
  );
  doc.save();
  doc.strokeColor(GOLD).lineWidth(0.5);
  doc.moveTo(MARGIN, y + 66).lineTo(PAGE_W - MARGIN, y + 66).stroke();
  doc.restore();
}

function drawVerdictBanner(doc: PDFKit.PDFDocument, summary: ReturnType<typeof summarize>) {
  const y = 138;
  const h = 62;
  const tone =
    summary.cmmcApplicability === "level_2_or_higher"
      ? STATUS_WARN
      : summary.cmmcApplicability === "level_1_only"
      ? GOLD
      : summary.cmmcApplicability === "none_indicated"
      ? STATUS_OK
      : BONE_SOFT;

  doc.save();
  doc.lineWidth(0.6).strokeColor(INK_SOFT);
  doc.rect(MARGIN, y, CONTENT_W, h).stroke();
  doc.rect(MARGIN, y, 4, h).fill(tone);
  doc.restore();

  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(7);
  doc.text("BOUNDARY SUMMARY", MARGIN + 14, y + 10, { characterSpacing: 1.5 });
  doc.fillColor(INK).font(FONT_BOLD).fontSize(11);
  doc.text(summary.headline, MARGIN + 14, y + 22, { width: CONTENT_W - 220 });

  const applicabilityLabel: Record<typeof summary.cmmcApplicability, string> = {
    level_2_or_higher: "CMMC LEVEL 2 (OR HIGHER)",
    level_1_only: "CMMC LEVEL 1",
    none_indicated: "CMMC NOT APPLICABLE",
    indeterminate: "INDETERMINATE"
  };
  doc.fillColor(BONE_SOFT).font(FONT_BOLD).fontSize(7);
  doc.text("APPLICABILITY", PAGE_W - MARGIN - 180, y + 10, {
    width: 170,
    align: "right",
    characterSpacing: 1.3
  });
  doc.fillColor(tone).font(FONT_BOLD).fontSize(11);
  doc.text(applicabilityLabel[summary.cmmcApplicability], PAGE_W - MARGIN - 180, y + 24, {
    width: 170,
    align: "right"
  });
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(8);
  doc.text(
    `${summary.boundary.inScopeItems} in-scope · ${summary.boundary.conditionalItems} conditional · ${summary.boundary.outOfScope} out-of-scope`,
    PAGE_W - MARGIN - 260,
    y + 44,
    { width: 250, align: "right" }
  );
}

function drawCategoryMatrix(doc: PDFKit.PDFDocument, summary: ReturnType<typeof summarize>) {
  const y = doc.y + 20 > 220 ? doc.y + 20 : 220;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("ASSET INVENTORY BY CATEGORY", MARGIN, y, { characterSpacing: 1.5 });

  const colW = [180, 60, 70, 70, 60, CONTENT_W - 440];
  let ry = y + 16;
  // Header row
  const headers = ["Category", "Apps", "Tech", "People", "Total", "Controls posture"];
  doc.save();
  doc.rect(MARGIN, ry, CONTENT_W, 18).fill(INK);
  doc.restore();
  let cx = MARGIN + 8;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(7.5);
  headers.forEach((h, i) => {
    doc.text(h.toUpperCase(), cx, ry + 5, { width: colW[i] - 8, characterSpacing: 0.8 });
    cx += colW[i];
  });
  ry += 20;

  for (const c of summary.perCategory) {
    if (c.total === 0) continue;
    doc.save();
    doc.lineWidth(0.4).strokeColor(INK_SOFT);
    doc.rect(MARGIN, ry, CONTENT_W, 26).stroke();
    doc.rect(MARGIN, ry, 3, 26).fill(toneColor(c.meta.tone));
    doc.restore();
    cx = MARGIN + 8;
    doc.fillColor(INK).font(FONT_BOLD).fontSize(9);
    doc.text(c.meta.label, cx, ry + 6, { width: colW[0] - 8 });
    doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7);
    doc.text(c.meta.shortLabel, cx, ry + 17, { width: colW[0] - 8 });
    cx += colW[0];
    doc.fillColor(INK).font(FONT_REG).fontSize(10);
    doc.text(String(c.applications), cx, ry + 8, { width: colW[1] - 8, align: "center" });
    cx += colW[1];
    doc.text(String(c.technology), cx, ry + 8, { width: colW[2] - 8, align: "center" });
    cx += colW[2];
    doc.text(String(c.people), cx, ry + 8, { width: colW[3] - 8, align: "center" });
    cx += colW[3];
    doc.font(FONT_BOLD).text(String(c.total), cx, ry + 8, { width: colW[4] - 8, align: "center" });
    cx += colW[4];
    doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7.5);
    doc.text(c.meta.controlsRequired, cx, ry + 5, { width: colW[5] - 8, lineGap: 1 });
    ry += 28;
  }

  if (summary.totals.unclassified > 0) {
    doc.fillColor(STATUS_BAD).font(FONT_OBL).fontSize(9);
    doc.text(
      `⚠  ${summary.totals.unclassified} item${summary.totals.unclassified === 1 ? "" : "s"} still unclassified — assign a scope category before finalising.`,
      MARGIN,
      ry + 6,
      { width: CONTENT_W }
    );
  }
}

function drawNotes(doc: PDFKit.PDFDocument, state: ScopingState) {
  if (!state.notes.trim()) return;
  const y = doc.y + 24;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("SCOPING NOTES", MARGIN, y, { characterSpacing: 1.5 });
  doc.fillColor(INK).font(FONT_REG).fontSize(9);
  doc.text(state.notes, MARGIN, y + 14, { width: CONTENT_W, align: "justify", lineGap: 2 });
}

function drawSignatureBlock(doc: PDFKit.PDFDocument, state: ScopingState) {
  const y = Math.max(doc.y + 18, PAGE_H - 180);
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("SIGN-OFF", MARGIN, y, { characterSpacing: 1.5 });
  const col = CONTENT_W / 2 - 6;
  const s = state.signatures;
  drawSigCol(doc, MARGIN, y + 14, col, "PREPARED BY", s.preparedByName, s.preparedByTitle, s.preparedByDate);
  drawSigCol(doc, MARGIN + col + 12, y + 14, col, "APPROVED BY", s.approvedByName, s.approvedByTitle, s.approvedByDate);
}

function drawSigCol(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  label: string,
  name: string,
  title: string,
  date: string
) {
  doc.save();
  doc.lineWidth(0.5).strokeColor(INK_SOFT);
  doc.rect(x, y, w, 110).stroke();
  doc.restore();
  doc.fillColor(BONE_SOFT).font(FONT_BOLD).fontSize(7);
  doc.text(label, x + 10, y + 8, { characterSpacing: 1.3 });
  doc.fillColor(INK).font(FONT_BOLD).fontSize(10);
  doc.text(name || " ", x + 10, y + 22, { width: w - 20 });
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(8);
  doc.text(title || " ", x + 10, y + 38, { width: w - 20 });
  doc.save();
  doc.strokeColor(INK_SOFT).lineWidth(0.5);
  doc.moveTo(x + 10, y + 78).lineTo(x + w - 10, y + 78).stroke();
  doc.restore();
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7);
  doc.text("Signature", x + 10, y + 80);
  doc.save();
  doc.strokeColor(INK_SOFT).lineWidth(0.5);
  doc.moveTo(x + 10, y + 98).lineTo(x + w - 10, y + 98).stroke();
  doc.restore();
  doc.fillColor(INK).font(FONT_REG).fontSize(9);
  doc.text(date || " ", x + 10, y + 88);
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7);
  doc.text("Date", x + 10, y + 100);
}

function drawKindSection(
  doc: PDFKit.PDFDocument,
  kind: ScopeKind,
  items: ScopeItem[],
  engagement: Engagement
) {
  const meta = KIND_META[kind];
  const y = 60;
  doc.fillColor(BONE_SOFT).font(FONT_BOLD).fontSize(8);
  doc.text(`APPENDIX · ${meta.label.toUpperCase()}`, MARGIN, y, { characterSpacing: 1.5 });
  doc.fillColor(INK).font(FONT_BOLD).fontSize(16);
  doc.text(`${meta.label} — ${items.length} inventoried`, MARGIN, y + 12, { width: CONTENT_W });
  doc.fillColor(BONE_SOFT).font(FONT_OBL).fontSize(9);
  doc.text(meta.description, MARGIN, y + 34, { width: CONTENT_W });
  doc.save();
  doc.strokeColor(GOLD).lineWidth(0.5);
  doc.moveTo(MARGIN, y + 58).lineTo(PAGE_W - MARGIN, y + 58).stroke();
  doc.restore();

  let ry = y + 74;
  for (const item of items) {
    if (ry > PAGE_H - 110) {
      doc.addPage();
      drawHeaderBand(doc, engagement);
      ry = 70;
    }
    const cat = item.scopeCategory
      ? CATEGORY_META[item.scopeCategory as ScopeCategory]
      : null;
    const tone = cat ? toneColor(cat.tone) : BONE_SOFT;
    const chipW = 90;
    doc.save();
    doc.lineWidth(0.4).strokeColor(INK_SOFT);
    doc.rect(MARGIN, ry, CONTENT_W, 70).stroke();
    doc.rect(MARGIN, ry, 3, 70).fill(tone);
    doc.restore();

    doc.fillColor(INK).font(FONT_BOLD).fontSize(10);
    doc.text(item.name || "(unnamed)", MARGIN + 12, ry + 8, { width: CONTENT_W - chipW - 30 });
    doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7.5);
    const metaLine = [
      item.owner && `owner: ${item.owner}`,
      item.location && `loc: ${item.location}`,
      item.vendor && `vendor: ${item.vendor}`,
      item.boundaryModel && `boundary: ${item.boundaryModel}`,
      item.dataTypes.length ? `data: ${item.dataTypes.join(", ")}` : null
    ]
      .filter(Boolean)
      .join("  ·  ");
    doc.text(metaLine, MARGIN + 12, ry + 22, { width: CONTENT_W - chipW - 30 });

    if (item.description) {
      doc.fillColor(INK_SOFT).font(FONT_REG).fontSize(8);
      doc.text(item.description, MARGIN + 12, ry + 34, { width: CONTENT_W - chipW - 30 });
    }
    if (item.scopeRationale) {
      doc.fillColor(INK).font(FONT_OBL).fontSize(8);
      doc.text(`Rationale: ${item.scopeRationale}`, MARGIN + 12, ry + 50, {
        width: CONTENT_W - chipW - 30
      });
    }

    // Category chip on the right
    doc.save();
    doc.rect(PAGE_W - MARGIN - chipW - 4, ry + 8, chipW, 22).fill(tone);
    doc.fillColor("#FFFFFF").font(FONT_BOLD).fontSize(9);
    doc.text(cat ? cat.shortLabel : "UNCLASSIFIED", PAGE_W - MARGIN - chipW - 4, ry + 15, {
      width: chipW,
      align: "center"
    });
    doc.restore();

    ry += 76;
  }
}

function drawPageFooter(doc: PDFKit.PDFDocument, engagement: Engagement) {
  const y = PAGE_H - 26;
  doc.save();
  doc.strokeColor(INK_SOFT).lineWidth(0.4);
  doc.moveTo(MARGIN, y - 6).lineTo(PAGE_W - MARGIN, y - 6).stroke();
  doc.restore();
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7);
  doc.text(
    `© ${engagement.rpoFirm || "CyberAutopsy LLC"} — ${engagement.classification || "CUI"} — Generated ${new Date().toISOString().slice(0, 10)}`,
    MARGIN,
    y,
    { width: CONTENT_W - 60 }
  );
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7);
  const page = (doc as unknown as { page: { number: number } }).page?.number ?? 1;
  doc.text(`Page ${page}`, MARGIN, y, { width: CONTENT_W, align: "right" });
}
