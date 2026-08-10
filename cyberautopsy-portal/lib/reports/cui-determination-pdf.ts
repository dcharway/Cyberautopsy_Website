/**
 * CUI Determination — printable PDF export.
 *
 * Letter portrait. Page 1: header, information-asset block, verdict banner,
 * rationale, categories selected, section summary, signatures. Page 2+: full
 * Q&A appendix with per-question answers + rationale notes.
 */

import PDFDocument from "pdfkit";
import {
  CUI_SECTIONS,
  CUI_CATEGORIES,
  determine,
  type AnswerValue
} from "@/data/cui-determination";
import type { CUIState } from "@/lib/cui-store";
import type { Engagement } from "@/lib/engagement";

const GOLD = "#D4AF37";
const INK = "#0A0A0B";
const INK_SOFT = "#2A2A2E";
const BONE = "#FAFAFA";
const BONE_SOFT = "#6E6E66";
const STATUS_OK = "#16A34A";
const STATUS_WARN = "#F59E0B";
const STATUS_BAD = "#DC2626";

const FONT_REG = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";
const FONT_OBL = "Helvetica-Oblique";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;

function verdictColor(v: string): string {
  switch (v) {
    case "not_cui": return STATUS_OK;
    case "cui_basic": return STATUS_WARN;
    case "cui_specified": return STATUS_WARN;
    case "enhanced_cui": return STATUS_BAD;
    default: return BONE_SOFT;
  }
}
function verdictLabel(v: string): string {
  switch (v) {
    case "not_cui": return "NOT CUI";
    case "cui_basic": return "CUI BASIC";
    case "cui_specified": return "CUI SPECIFIED";
    case "enhanced_cui": return "ENHANCED CUI (CMMC LEVEL 3)";
    default: return "INDETERMINATE";
  }
}
function answerLabel(a: AnswerValue): string {
  if (a === "yes") return "YES";
  if (a === "no") return "NO";
  if (a === "na") return "N/A";
  if (a === "unknown") return "UNKNOWN";
  return "—";
}
function answerColor(a: AnswerValue): string {
  if (a === "yes") return STATUS_WARN;
  if (a === "no") return STATUS_OK;
  if (a === "unknown") return STATUS_BAD;
  return BONE_SOFT;
}

export async function buildCUIDeterminationPDF(
  state: CUIState,
  engagement: Engagement
): Promise<Buffer> {
  const det = determine(state.answers, state.selectedCategoryCodes);
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        info: {
          Title: `CUI Determination — ${engagement.organization}`,
          Author: "CyberAutopsy GRC Portal",
          Subject: "Controlled Unclassified Information determination",
          Keywords: "CUI, NARA CUI Registry, 32 CFR 2002, DoDI 5200.48, NIST 800-171, CMMC"
        }
      });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      drawHeaderBand(doc, engagement);
      drawTitle(doc, engagement, state);
      drawAssetBlock(doc, state);
      drawVerdictBanner(doc, det.verdict, det.cuiLevel, det.recommendedCMMCLevel, det.headline);
      drawRationale(doc, det.rationale);
      drawCategories(doc, state, det.categoryFindings);
      drawSectionSummary(doc, det.bySection);
      drawSignatureBlock(doc, state);
      drawPageFooter(doc, engagement);

      doc.addPage();
      drawHeaderBand(doc, engagement);
      drawAppendixHeader(doc);
      drawFullQA(doc, state, engagement);
      drawPageFooter(doc, engagement);

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

function drawTitle(doc: PDFKit.PDFDocument, engagement: Engagement, state: CUIState) {
  const y = 60;
  doc.fillColor(BONE_SOFT).font(FONT_BOLD).fontSize(8);
  doc.text("CUI DETERMINATION", MARGIN, y, { characterSpacing: 1.5 });
  doc.fillColor(INK).font(FONT_BOLD).fontSize(20);
  doc.text("Controlled Unclassified Information — asset determination", MARGIN, y + 12, {
    width: CONTENT_W
  });
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(9);
  doc.text(
    `${engagement.organizationLegal}  ·  CAGE ${engagement.cage}  ·  Reporting ${engagement.reportingPeriod}  ·  Prepared ${state.updatedAt.slice(0, 10)}`,
    MARGIN,
    y + 44,
    { width: CONTENT_W }
  );
  doc.save();
  doc.strokeColor(GOLD).lineWidth(0.5);
  doc.moveTo(MARGIN, y + 66).lineTo(PAGE_W - MARGIN, y + 66).stroke();
  doc.restore();
}

function drawAssetBlock(doc: PDFKit.PDFDocument, state: CUIState) {
  const y = 138;
  const a = state.assetHeader;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("INFORMATION ASSET UNDER REVIEW", MARGIN, y, { characterSpacing: 1.5 });

  const rows: Array<[string, string]> = [
    ["Asset name", a.assetName || "—"],
    ["Source (originator)", a.source || "—"],
    ["Format", a.format || "—"],
    ["Storage systems", a.systems || "—"],
    ["Volume", a.volume || "—"],
    ["Linked to DoD contract", a.dodContractLinked === "yes" ? "Yes" : a.dodContractLinked === "no" ? "No" : "—"],
    ["Linked contract #", a.linkedContractNumber || "—"]
  ];
  let ry = y + 14;
  for (const [k, v] of rows) {
    doc.font(FONT_BOLD).fillColor(BONE_SOFT).fontSize(7);
    doc.text(k.toUpperCase(), MARGIN, ry, { width: 180, characterSpacing: 0.8 });
    doc.font(FONT_REG).fillColor(INK).fontSize(9);
    doc.text(v, MARGIN + 180, ry, { width: CONTENT_W - 180 });
    ry += 14;
  }
  if (a.description) {
    ry += 4;
    doc.font(FONT_BOLD).fillColor(BONE_SOFT).fontSize(7);
    doc.text("DESCRIPTION", MARGIN, ry, { characterSpacing: 0.8 });
    ry += 10;
    doc.font(FONT_REG).fillColor(INK).fontSize(9);
    doc.text(a.description, MARGIN, ry, { width: CONTENT_W });
  }
}

function drawVerdictBanner(
  doc: PDFKit.PDFDocument,
  verdict: string,
  cuiLevel: string,
  cmmcLevel: number,
  headline: string
) {
  const y = doc.y + 24 > 310 ? doc.y + 24 : 310;
  const h = 64;
  const tone = verdictColor(verdict);

  doc.save();
  doc.lineWidth(0.6).strokeColor(INK_SOFT);
  doc.rect(MARGIN, y, CONTENT_W, h).stroke();
  doc.rect(MARGIN, y, 4, h).fill(tone);
  doc.restore();

  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(7);
  doc.text("DETERMINATION", MARGIN + 14, y + 8, { characterSpacing: 1.5 });

  doc.fillColor(INK).font(FONT_BOLD).fontSize(13);
  doc.text(verdictLabel(verdict), MARGIN + 14, y + 20, { width: CONTENT_W - 200 });

  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(9);
  doc.text(headline, MARGIN + 14, y + 38, { width: CONTENT_W - 200 });

  doc.fillColor(BONE_SOFT).font(FONT_BOLD).fontSize(7);
  doc.text("CMMC LEVEL", PAGE_W - MARGIN - 180, y + 8, {
    width: 170,
    align: "right",
    characterSpacing: 1.3
  });
  doc.fillColor(tone).font(FONT_BOLD).fontSize(28);
  doc.text(cmmcLevel === 0 ? "—" : `L${cmmcLevel}`, PAGE_W - MARGIN - 180, y + 22, {
    width: 170,
    align: "right"
  });
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(8);
  doc.text(
    cuiLevel === "none" ? "" : `CUI ${cuiLevel.toUpperCase()}`,
    PAGE_W - MARGIN - 180,
    y + 52,
    { width: 170, align: "right" }
  );
}

function drawRationale(doc: PDFKit.PDFDocument, rationale: string) {
  const y = doc.y + 16;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("RATIONALE", MARGIN, y, { characterSpacing: 1.5 });
  doc.fillColor(INK).font(FONT_REG).fontSize(9.5);
  doc.text(rationale, MARGIN, y + 14, { width: CONTENT_W, align: "justify", lineGap: 2 });
}

function drawCategories(
  doc: PDFKit.PDFDocument,
  state: CUIState,
  categoryFindings: ReturnType<typeof determine>["categoryFindings"]
) {
  const y = doc.y + 16;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("SELECTED CUI CATEGORIES (NARA REGISTRY)", MARGIN, y, { characterSpacing: 1.5 });

  let ry = y + 14;
  if (categoryFindings.selected.length === 0 && !state.categoryOtherNote.trim()) {
    doc.fillColor(BONE_SOFT).font(FONT_OBL).fontSize(9);
    doc.text("None selected.", MARGIN, ry, { width: CONTENT_W });
    return;
  }
  for (const c of categoryFindings.selected) {
    const rowH = 18;
    doc.save();
    doc.lineWidth(0.4).strokeColor(INK_SOFT);
    doc.rect(MARGIN, ry, CONTENT_W, rowH).stroke();
    doc.restore();
    doc.fillColor(INK).font(FONT_BOLD).fontSize(9);
    doc.text(`${c.code}  ·  ${c.name}`, MARGIN + 8, ry + 4, { width: CONTENT_W - 180 });
    doc.fillColor(c.specifiedByDefault ? STATUS_WARN : BONE_SOFT).font(FONT_BOLD).fontSize(7);
    doc.text(c.specifiedByDefault ? "SPECIFIED" : "BASIC", PAGE_W - MARGIN - 160, ry + 5, {
      width: 60,
      align: "right",
      characterSpacing: 1.3
    });
    doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7);
    doc.text(c.authority, PAGE_W - MARGIN - 92, ry + 5, {
      width: 82,
      align: "right"
    });
    ry += rowH + 2;
  }
  if (state.categoryOtherNote.trim()) {
    doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(8);
    doc.text(`OTHER (free-text): ${state.categoryOtherNote}`, MARGIN, ry + 4, {
      width: CONTENT_W
    });
  }
}

function drawSectionSummary(
  doc: PDFKit.PDFDocument,
  bySection: ReturnType<typeof determine>["bySection"]
) {
  const y = doc.y + 16;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("SECTION SUMMARY", MARGIN, y, { characterSpacing: 1.5 });
  let ry = y + 14;
  const rowH = 18;
  for (const r of bySection) {
    doc.save();
    doc.lineWidth(0.4).strokeColor(INK_SOFT);
    doc.rect(MARGIN, ry, CONTENT_W, rowH).stroke();
    doc.restore();
    doc.fillColor(INK).font(FONT_BOLD).fontSize(9);
    doc.text(`${r.section.number}. ${r.section.title}`, MARGIN + 8, ry + 4, {
      width: CONTENT_W - 260
    });
    doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(8);
    doc.text(
      `Answered ${r.answered}/${r.total} · ${r.positiveYes} positive Yes · ${r.negativeYes} counter-indicator Yes`,
      PAGE_W - MARGIN - 250,
      ry + 5,
      { width: 240, align: "right" }
    );
    ry += rowH + 2;
  }
}

function drawSignatureBlock(doc: PDFKit.PDFDocument, state: CUIState) {
  const y = Math.max(doc.y + 18, PAGE_H - 200);
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

function drawAppendixHeader(doc: PDFKit.PDFDocument) {
  const y = 60;
  doc.fillColor(BONE_SOFT).font(FONT_BOLD).fontSize(8);
  doc.text("APPENDIX — FULL QUESTIONNAIRE + ANSWERS", MARGIN, y, { characterSpacing: 1.5 });
  doc.fillColor(INK).font(FONT_BOLD).fontSize(16);
  doc.text("Every question, every answer, every rationale note.", MARGIN, y + 12, {
    width: CONTENT_W
  });
  doc.save();
  doc.strokeColor(GOLD).lineWidth(0.5);
  doc.moveTo(MARGIN, y + 40).lineTo(PAGE_W - MARGIN, y + 40).stroke();
  doc.restore();
}

function drawFullQA(doc: PDFKit.PDFDocument, state: CUIState, engagement: Engagement) {
  let y = 118;
  for (const section of CUI_SECTIONS) {
    if (section.items.length === 0) continue;

    if (y > PAGE_H - 140) {
      doc.addPage();
      drawHeaderBand(doc, engagement);
      y = 60;
    }
    doc.fillColor(GOLD).font(FONT_BOLD).fontSize(9);
    doc.text(`SECTION ${section.number} — ${section.title.toUpperCase()}`, MARGIN, y, {
      characterSpacing: 1.3
    });
    y += 14;
    doc.fillColor(BONE_SOFT).font(FONT_OBL).fontSize(8);
    doc.text(section.description, MARGIN, y, { width: CONTENT_W });
    y = doc.y + 8;

    for (const q of section.items) {
      if (y > PAGE_H - 90) {
        doc.addPage();
        drawHeaderBand(doc, engagement);
        y = 60;
      }
      const answer = state.answers[q.id] ?? null;
      const note = state.rationaleNotes[q.id] ?? "";
      doc.fillColor(INK).font(FONT_BOLD).fontSize(9);
      doc.text(`${q.number}`, MARGIN, y, { width: 28 });
      doc.font(FONT_REG).fillColor(INK).fontSize(9);
      doc.text(q.prompt, MARGIN + 28, y, { width: CONTENT_W - 28 - 80 });
      const answerX = PAGE_W - MARGIN - 70;
      const answerY = y;
      doc.save();
      doc.rect(answerX, answerY, 70, 18).fill(answerColor(answer));
      doc.fillColor("#FFFFFF").font(FONT_BOLD).fontSize(9);
      doc.text(answerLabel(answer), answerX, answerY + 5, { width: 70, align: "center" });
      doc.restore();
      y = doc.y + 4;
      if (q.reference) {
        doc.fillColor(BONE_SOFT).font(FONT_OBL).fontSize(7.5);
        doc.text(`Reference: ${q.reference}`, MARGIN + 28, y, { width: CONTENT_W - 28 });
        y = doc.y + 2;
      }
      if (note.trim()) {
        doc.fillColor(INK_SOFT).font(FONT_REG).fontSize(8);
        doc.text(`Rationale: ${note}`, MARGIN + 28, y, { width: CONTENT_W - 28 });
        y = doc.y + 4;
      }
      y += 6;
    }
    y += 6;
  }

  // Category appendix
  if (y > PAGE_H - 120) {
    doc.addPage();
    drawHeaderBand(doc, engagement);
    y = 60;
  }
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(9);
  doc.text("CUI CATEGORY CATALOG (NARA REGISTRY — DEFENSE-RELEVANT SUBSET)", MARGIN, y, {
    characterSpacing: 1.3
  });
  y += 16;
  for (const c of CUI_CATEGORIES) {
    if (y > PAGE_H - 60) {
      doc.addPage();
      drawHeaderBand(doc, engagement);
      y = 60;
    }
    const selected = state.selectedCategoryCodes.includes(c.code);
    doc.save();
    doc.rect(MARGIN, y, 10, 10).lineWidth(0.6).strokeColor(INK_SOFT).stroke();
    if (selected) doc.rect(MARGIN + 2, y + 2, 6, 6).fill(GOLD);
    doc.restore();
    doc.fillColor(INK).font(FONT_BOLD).fontSize(9);
    doc.text(`${c.code}  ·  ${c.name}`, MARGIN + 18, y - 1, { width: CONTENT_W - 100 });
    doc.fillColor(c.specifiedByDefault ? STATUS_WARN : BONE_SOFT).font(FONT_BOLD).fontSize(7);
    doc.text(c.specifiedByDefault ? "SPECIFIED" : "BASIC", PAGE_W - MARGIN - 80, y, {
      width: 70,
      align: "right",
      characterSpacing: 1.3
    });
    doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7.5);
    doc.text(c.authority, MARGIN + 18, doc.y + 1, { width: CONTENT_W - 30 });
    y = doc.y + 6;
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
