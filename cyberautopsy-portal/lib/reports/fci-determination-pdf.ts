/**
 * FCI Determination — printable PDF export.
 *
 * Layout (Letter, portrait):
 *   Page 1: header, contract identification, verdict banner, rationale
 *   Page 1 cont.: signature block
 *   Page 2+ : full Q&A appendix
 */

import PDFDocument from "pdfkit";
import { FCI_SECTIONS, determine, type AnswerValue } from "@/data/fci-determination";
import type { FCIState } from "@/lib/fci-store";
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
    case "none": return STATUS_OK;
    case "fci_only": return GOLD;
    case "cui": return STATUS_WARN;
    case "enhanced_cui": return STATUS_BAD;
    default: return BONE_SOFT;
  }
}

function verdictLabel(v: string): string {
  switch (v) {
    case "none": return "NO CMMC REQUIRED";
    case "fci_only": return "CMMC LEVEL 1 REQUIRED";
    case "cui": return "CMMC LEVEL 2 REQUIRED";
    case "enhanced_cui": return "CMMC LEVEL 3 REQUIRED";
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

export async function buildFCIDeterminationPDF(
  state: FCIState,
  engagement: Engagement
): Promise<Buffer> {
  const det = determine(state.answers);
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        info: {
          Title: `FCI Determination — ${engagement.organization}`,
          Author: "CyberAutopsy GRC Portal",
          Subject: "CMMC Applicability / FCI + CUI Determination",
          Keywords: "FCI, CUI, CMMC, FAR 52.204-21, DFARS 252.204-7012"
        }
      });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ---- HEADER BAND (page 1) ----
      drawHeaderBand(doc, engagement);
      drawTitle(doc, engagement, state);
      drawContractBlock(doc, state);
      drawVerdictBanner(doc, det.verdict, det.recommendedLevel, det.headline);
      drawRationale(doc, det.rationale);
      drawSectionSummary(doc, det.bySection);
      drawSignatureBlock(doc, state);
      drawPageFooter(doc, engagement);

      // ---- APPENDIX (page 2+) ----
      doc.addPage();
      drawHeaderBand(doc, engagement);
      drawAppendixHeader(doc);
      drawFullQA(doc, state);
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

function drawTitle(doc: PDFKit.PDFDocument, engagement: Engagement, state: FCIState) {
  const y = 60;
  doc.fillColor(BONE_SOFT).font(FONT_BOLD).fontSize(8);
  doc.text("FCI / CUI DETERMINATION", MARGIN, y, { characterSpacing: 1.5 });
  doc.fillColor(INK).font(FONT_BOLD).fontSize(20);
  doc.text("Contract scoping and CMMC applicability determination", MARGIN, y + 12, { width: CONTENT_W });
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(9);
  doc.text(
    `${engagement.organizationLegal}  ·  CAGE ${engagement.cage}  ·  ${engagement.reportingPeriod}  ·  Prepared ${state.updatedAt.slice(0, 10)}`,
    MARGIN,
    y + 44,
    { width: CONTENT_W }
  );
  doc.save();
  doc.strokeColor(GOLD).lineWidth(0.5);
  doc.moveTo(MARGIN, y + 66).lineTo(PAGE_W - MARGIN, y + 66).stroke();
  doc.restore();
}

function drawContractBlock(doc: PDFKit.PDFDocument, state: FCIState) {
  const y = 138;
  const h = state.header;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("CONTRACT UNDER REVIEW", MARGIN, y, { characterSpacing: 1.5 });

  const rows: Array<[string, string]> = [
    ["Contract / task order #", h.contractNumber || "—"],
    ["Contracting agency", h.contractingAgency || "—"],
    ["Contract type", h.contractType || "—"],
    ["Period of performance", h.periodOfPerformance || "—"],
    ["Prime or sub", h.primeOrSub ? h.primeOrSub.toUpperCase() : "—"],
    ["Prime contractor (if sub)", h.primeContractor || "—"]
  ];
  let ry = y + 14;
  doc.fillColor(INK).font(FONT_REG).fontSize(9);
  for (const [k, v] of rows) {
    doc.font(FONT_BOLD).fillColor(BONE_SOFT).fontSize(7);
    doc.text(k.toUpperCase(), MARGIN, ry, { width: 180, characterSpacing: 0.8 });
    doc.font(FONT_REG).fillColor(INK).fontSize(9);
    doc.text(v, MARGIN + 180, ry, { width: CONTENT_W - 180 });
    ry += 14;
  }
  if (h.contractDescription) {
    ry += 4;
    doc.font(FONT_BOLD).fillColor(BONE_SOFT).fontSize(7);
    doc.text("DESCRIPTION", MARGIN, ry, { characterSpacing: 0.8 });
    ry += 10;
    doc.font(FONT_REG).fillColor(INK).fontSize(9);
    doc.text(h.contractDescription, MARGIN, ry, { width: CONTENT_W });
  }
}

function drawVerdictBanner(
  doc: PDFKit.PDFDocument,
  verdict: string,
  level: number,
  headline: string
) {
  const y = doc.y + 24 > 280 ? doc.y + 24 : 280;
  const h = 60;
  const tone = verdictColor(verdict);

  doc.save();
  doc.lineWidth(0.6).strokeColor(INK_SOFT);
  doc.rect(MARGIN, y, CONTENT_W, h).stroke();
  doc.rect(MARGIN, y, 4, h).fill(tone);
  doc.restore();

  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(7);
  doc.text("DETERMINATION", MARGIN + 14, y + 10, { characterSpacing: 1.5 });

  doc.fillColor(INK).font(FONT_BOLD).fontSize(13);
  doc.text(verdictLabel(verdict), MARGIN + 14, y + 22, { width: CONTENT_W - 200 });

  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(9);
  doc.text(headline, MARGIN + 14, y + 40, { width: CONTENT_W - 200 });

  // Level chip on the right
  doc.fillColor(BONE_SOFT).font(FONT_BOLD).fontSize(7);
  doc.text("RECOMMENDED LEVEL", PAGE_W - MARGIN - 180, y + 10, { width: 170, align: "right", characterSpacing: 1.3 });
  doc.fillColor(tone).font(FONT_BOLD).fontSize(28);
  doc.text(level === 0 ? "—" : `L${level}`, PAGE_W - MARGIN - 180, y + 24, { width: 170, align: "right" });
}

function drawRationale(doc: PDFKit.PDFDocument, rationale: string) {
  const y = doc.y + 16;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("RATIONALE", MARGIN, y, { characterSpacing: 1.5 });
  doc.fillColor(INK).font(FONT_REG).fontSize(9.5);
  doc.text(rationale, MARGIN, y + 14, { width: CONTENT_W, align: "justify", lineGap: 2 });
}

function drawSectionSummary(
  doc: PDFKit.PDFDocument,
  bySection: ReturnType<typeof determine>["bySection"]
) {
  const y = doc.y + 16;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("SECTION SUMMARY", MARGIN, y, { characterSpacing: 1.5 });

  const rowH = 20;
  let ry = y + 14;
  for (const r of bySection) {
    doc.save();
    doc.lineWidth(0.4).strokeColor(INK_SOFT);
    doc.rect(MARGIN, ry, CONTENT_W, rowH).stroke();
    doc.restore();
    doc.fillColor(INK).font(FONT_BOLD).fontSize(9);
    doc.text(`${r.section.number}. ${r.section.title}`, MARGIN + 8, ry + 5, { width: CONTENT_W - 260 });
    doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(8);
    doc.text(
      `Answered ${r.answered}/${r.total}  ·  ${r.positiveYes} positive Yes  ·  ${r.negativeYes} counter-indicator Yes`,
      PAGE_W - MARGIN - 250,
      ry + 5,
      { width: 240, align: "right" }
    );
    ry += rowH + 2;
  }
}

function drawSignatureBlock(doc: PDFKit.PDFDocument, state: FCIState) {
  const y = Math.max(doc.y + 20, PAGE_H - 200);
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("SIGN-OFF", MARGIN, y, { characterSpacing: 1.5 });

  const col = CONTENT_W / 2 - 6;
  const s = state.signatures;

  // Preparer
  drawSigCol(doc, MARGIN, y + 14, col, "PREPARED BY", s.preparedByName, s.preparedByTitle, s.preparedByDate);
  // Approver
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

  // Signature line
  doc.save();
  doc.strokeColor(INK_SOFT).lineWidth(0.5);
  doc.moveTo(x + 10, y + 78).lineTo(x + w - 10, y + 78).stroke();
  doc.restore();
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7);
  doc.text("Signature", x + 10, y + 80);

  // Date line
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
  doc.text("Every question, every answer, every rationale note.", MARGIN, y + 12, { width: CONTENT_W });
  doc.save();
  doc.strokeColor(GOLD).lineWidth(0.5);
  doc.moveTo(MARGIN, y + 40).lineTo(PAGE_W - MARGIN, y + 40).stroke();
  doc.restore();
}

function drawFullQA(doc: PDFKit.PDFDocument, state: FCIState) {
  let y = 118;
  for (const section of FCI_SECTIONS) {
    if (section.items.length === 0) continue;

    if (y > PAGE_H - 140) {
      doc.addPage();
      drawHeaderBand(doc, { classification: "Controlled Unclassified Information (CUI)", organization: "" } as never);
      y = 60;
    }
    doc.fillColor(GOLD).font(FONT_BOLD).fontSize(9);
    doc.text(`SECTION ${section.number} — ${section.title.toUpperCase()}`, MARGIN, y, { characterSpacing: 1.3 });
    y += 14;
    doc.fillColor(BONE_SOFT).font(FONT_OBL).fontSize(8);
    doc.text(section.description, MARGIN, y, { width: CONTENT_W });
    y = doc.y + 8;

    for (const q of section.items) {
      if (y > PAGE_H - 90) {
        doc.addPage();
        drawHeaderBand(doc, { classification: "Controlled Unclassified Information (CUI)", organization: "" } as never);
        y = 60;
      }
      const answer = state.answers[q.id] ?? null;
      const note = state.rationaleNotes[q.id] ?? "";

      // Question row
      doc.fillColor(INK).font(FONT_BOLD).fontSize(9);
      doc.text(`${q.number}`, MARGIN, y, { width: 28 });
      doc.font(FONT_REG).fillColor(INK).fontSize(9);
      doc.text(q.prompt, MARGIN + 28, y, { width: CONTENT_W - 28 - 80 });

      // Answer chip on the right
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
