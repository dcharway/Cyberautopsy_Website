/**
 * Executive Brief — one-page PDF for board / leadership review.
 *
 * Mandatory content (per the brief spec):
 *   - SPRS score
 *   - Number of controls met
 *   - Top five risks
 *   - Days remaining until next affirmation
 *
 * Layout (Letter, portrait, single page):
 *   ┌──────────────────────────────────────────────────────────┐
 *   │  CYBERAUTOPSY ▌ Executive Brief — CMMC L2 Posture        │  ← gold header bar
 *   │  Organization · CAGE · Reporting period · Classification │
 *   ├──────────────────────────────────────────────────────────┤
 *   │  ┌───────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │  ← KPI tiles
 *   │  │ SPRS  │ │ Controls │ │ Open POAM│ │ Days to next │   │
 *   │  │  93   │ │  78/110  │ │    8     │ │ affirmation  │   │
 *   │  └───────┘ └──────────┘ └──────────┘ └──────────────┘   │
 *   │  Executive narrative                                     │
 *   │  Top 5 risks (numbered, with driver + impact)            │
 *   │  Affirmation status banner                               │
 *   │  Footer: classification · firm · generated · page 1/1    │
 *   └──────────────────────────────────────────────────────────┘
 *
 * pdfkit is pure-JS and ships its 14 standard fonts (Helvetica, Times, Courier
 * variants) as embedded .afm files — no font loading needed. Output is buffered
 * fully so we can set Content-Length on the response.
 */

import PDFDocument from "pdfkit";
import { buildExecutiveBriefSnapshot, type ExecutiveBriefSnapshot, type RiskItem } from "./executive-brief-data";

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

const PAGE_W = 612;       // Letter portrait
const PAGE_H = 792;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;

export async function buildExecutiveBrief(): Promise<Buffer> {
  const snap = await buildExecutiveBriefSnapshot();
  return renderExecutiveBriefPDF(snap);
}

export async function renderExecutiveBriefPDF(snap: ExecutiveBriefSnapshot): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        info: {
          Title: `Executive Brief — ${snap.engagement.organization}`,
          Author: "CyberAutopsy GRC Portal",
          Subject: "CMMC Level 2 Executive Brief",
          Keywords: "CMMC, SPRS, POA&M, Affirmation, Board"
        }
      });

      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      drawHeader(doc, snap);
      drawMetaStrip(doc, snap);
      drawKPIs(doc, snap);
      drawNarrative(doc, snap);
      drawTopRisks(doc, snap);
      drawAffirmationBanner(doc, snap);
      drawFooter(doc, snap);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* ---------- sections ---------- */

function drawHeader(doc: PDFKit.PDFDocument, snap: ExecutiveBriefSnapshot) {
  // Ink band
  doc.save();
  doc.rect(0, 0, PAGE_W, 64).fill(INK);
  // Gold accent rail
  doc.rect(0, 64, PAGE_W, 3).fill(GOLD);

  // Brand wordmark
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(12);
  doc.text("CYBERAUTOPSY", MARGIN, 18, { characterSpacing: 2.5 });

  // Subtitle (right side)
  doc.fillColor(BONE).font(FONT_REG).fontSize(9);
  doc.text("EXECUTIVE BRIEF · CMMC LEVEL 2", MARGIN, 38, { characterSpacing: 1.5 });

  doc.fillColor(BONE).font(FONT_BOLD).fontSize(9);
  const stamp = snap.generatedAt.toISOString().slice(0, 10);
  doc.text(`PREPARED ${stamp.toUpperCase()}`, MARGIN, 18, {
    width: CONTENT_W,
    align: "right",
    characterSpacing: 1.5
  });

  doc.fillColor(BONE).font(FONT_REG).fontSize(8);
  doc.text(`Classification · ${snap.engagement.classification}`, MARGIN, 38, {
    width: CONTENT_W,
    align: "right"
  });
  doc.restore();
}

function drawMetaStrip(doc: PDFKit.PDFDocument, snap: ExecutiveBriefSnapshot) {
  const y = 80;
  const e = snap.engagement;

  doc.fillColor(INK).font(FONT_BOLD).fontSize(20);
  doc.text(e.organization, MARGIN, y, { width: CONTENT_W });

  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(9);
  doc.text(
    [
      `CAGE ${e.cage}`,
      e.systemBoundary,
      `Reporting ${e.reportingPeriod}`,
      `Doc ${e.documentVersion}`,
      `Lead assessor: ${e.assessor}`,
      `C3PAO: ${e.c3paoFirm || "—"}`
    ].join("  ·  "),
    MARGIN,
    y + 28,
    { width: CONTENT_W }
  );

  // Divider
  doc.save();
  doc.strokeColor(GOLD).lineWidth(0.5);
  doc.moveTo(MARGIN, y + 50).lineTo(PAGE_W - MARGIN, y + 50).stroke();
  doc.restore();
}

function drawKPIs(doc: PDFKit.PDFDocument, snap: ExecutiveBriefSnapshot) {
  const top = 142;
  const tileH = 68;
  const gap = 10;
  const tileW = (CONTENT_W - gap * 3) / 4;

  const tiles: Array<{
    label: string;
    value: string;
    sub: string;
    color: string;
  }> = [
    {
      label: "SPRS SCORE",
      value: `${snap.sprsScore}`,
      sub: `of 110 · threshold 88 (${snap.sprsPassing ? "PASS" : "FAIL"})`,
      color: snap.sprsPassing ? STATUS_OK : STATUS_BAD
    },
    {
      label: "CONTROLS MET",
      value: `${snap.controlsMet} / ${snap.controlsTotal}`,
      sub: `${snap.controlsPartial} partial · ${snap.controlsMissing} unaddressed`,
      color: snap.controlsMet >= 95 ? STATUS_OK : snap.controlsMet >= 78 ? STATUS_WARN : STATUS_BAD
    },
    {
      label: "OPEN POA&Ms",
      value: `${snap.poamsOpen + snap.poamsInRemediation + snap.poamsPendingReview}`,
      sub: snap.poamsOverdue > 0
        ? `${snap.poamsOverdue} overdue · ${snap.poamsClosed} closed this cycle`
        : `0 overdue · ${snap.poamsClosed} closed this cycle`,
      color: snap.poamsOverdue > 0 ? STATUS_BAD : snap.poamsOpen + snap.poamsInRemediation === 0 ? STATUS_OK : STATUS_WARN
    },
    {
      label: "DAYS TO AFFIRMATION",
      value: snap.daysToAffirmation < 0 ? `${Math.abs(snap.daysToAffirmation)}+` : `${snap.daysToAffirmation}`,
      sub: snap.daysToAffirmation < 0
        ? `OVERDUE since ${snap.nextAffirmationDue}`
        : `due ${snap.nextAffirmationDue}`,
      color:
        snap.affirmationStatus === "Overdue"
          ? STATUS_BAD
          : snap.affirmationStatus === "Due soon"
          ? STATUS_WARN
          : STATUS_OK
    }
  ];

  tiles.forEach((t, i) => {
    const x = MARGIN + i * (tileW + gap);
    // Tile frame
    doc.save();
    doc.lineWidth(0.6).strokeColor(INK_SOFT);
    doc.rect(x, top, tileW, tileH).stroke();
    // Accent stripe
    doc.rect(x, top, 3, tileH).fill(t.color);
    doc.restore();

    doc.fillColor(BONE_SOFT).font(FONT_BOLD).fontSize(7);
    doc.text(t.label, x + 10, top + 8, { width: tileW - 14, characterSpacing: 1.4 });

    doc.fillColor(INK).font(FONT_BOLD).fontSize(22);
    doc.text(t.value, x + 10, top + 20, { width: tileW - 14 });

    doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7.5);
    doc.text(t.sub, x + 10, top + 50, { width: tileW - 14 });
  });
}

function drawNarrative(doc: PDFKit.PDFDocument, snap: ExecutiveBriefSnapshot) {
  const top = 230;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("EXECUTIVE NARRATIVE", MARGIN, top, { characterSpacing: 1.6 });
  doc.fillColor(INK).font(FONT_REG).fontSize(10);
  doc.text(snap.executiveNarrative, MARGIN, top + 14, {
    width: CONTENT_W,
    align: "justify",
    lineGap: 2
  });
}

function drawTopRisks(doc: PDFKit.PDFDocument, snap: ExecutiveBriefSnapshot) {
  // Position is dynamic based on where narrative ended.
  let y = doc.y + 18;
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(8);
  doc.text("TOP 5 RISKS", MARGIN, y, { characterSpacing: 1.6 });
  y += 14;

  if (snap.topRisks.length === 0) {
    doc.fillColor(BONE_SOFT).font(FONT_OBL).fontSize(10);
    doc.text(
      "No open risks of board significance — the assessment is in a clean state.",
      MARGIN,
      y,
      { width: CONTENT_W }
    );
    return;
  }

  for (const r of snap.topRisks) {
    drawRiskRow(doc, r, y);
    y = doc.y + 8;
  }
}

function drawRiskRow(doc: PDFKit.PDFDocument, r: RiskItem, y: number) {
  const rankBoxW = 24;
  const textX = MARGIN + rankBoxW + 8;
  const textW = CONTENT_W - rankBoxW - 8;

  // Rank chip
  doc.save();
  doc.rect(MARGIN, y, rankBoxW, 22).fill(INK);
  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(11);
  doc.text(String(r.rank), MARGIN, y + 6, { width: rankBoxW, align: "center" });
  doc.restore();

  // Title
  doc.fillColor(INK).font(FONT_BOLD).fontSize(10);
  doc.text(r.title, textX, y, { width: textW });

  // Meta line
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(8);
  const metaY = doc.y + 1;
  doc.text(
    `${r.controlId}  ·  ${r.family}  ·  weight ${r.weight}  ·  owner ${r.ownerLabel}  ·  ${r.status}`,
    textX,
    metaY,
    { width: textW, characterSpacing: 0.3 }
  );

  // Driver
  doc.fillColor(INK_SOFT).font(FONT_REG).fontSize(8.5);
  doc.text(r.driver, textX, doc.y + 1, { width: textW, lineGap: 1 });

  // Impact (italic, board-language)
  doc.fillColor(INK).font(FONT_OBL).fontSize(8.5);
  doc.text(r.impact, textX, doc.y + 2, { width: textW, lineGap: 1 });
}

function drawAffirmationBanner(doc: PDFKit.PDFDocument, snap: ExecutiveBriefSnapshot) {
  let y = doc.y + 18;
  if (y > 705) y = 705; // pin to bottom area to keep one page

  const h = 44;
  const tone =
    snap.affirmationStatus === "Overdue"
      ? STATUS_BAD
      : snap.affirmationStatus === "Due soon"
      ? STATUS_WARN
      : STATUS_OK;

  doc.save();
  doc.lineWidth(0.6).strokeColor(INK_SOFT);
  doc.rect(MARGIN, y, CONTENT_W, h).stroke();
  doc.rect(MARGIN, y, 3, h).fill(tone);
  doc.restore();

  doc.fillColor(GOLD).font(FONT_BOLD).fontSize(7.5);
  doc.text("ANNUAL AFFIRMATION (32 CFR §170.22)", MARGIN + 10, y + 7, { characterSpacing: 1.5 });

  doc.fillColor(INK).font(FONT_BOLD).fontSize(10);
  const headline =
    snap.affirmationStatus === "Overdue"
      ? `Overdue by ${Math.abs(snap.daysToAffirmation)} days — file without further delay`
      : snap.affirmationStatus === "Due soon"
      ? `Due in ${snap.daysToAffirmation} days — schedule signing this cycle`
      : `Current — next due in ${snap.daysToAffirmation} days`;
  doc.text(headline, MARGIN + 10, y + 19, { width: CONTENT_W - 220 });

  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(8);
  doc.text(
    `Signing officer: ${snap.engagement.affirmingOfficial} (${snap.engagement.affirmingOfficialTitle})`,
    MARGIN + 10,
    y + 31,
    { width: CONTENT_W - 220 }
  );

  // Due date callout (right side)
  doc.fillColor(BONE_SOFT).font(FONT_BOLD).fontSize(7);
  doc.text("NEXT AFFIRMATION DUE", PAGE_W - MARGIN - 200, y + 7, { width: 190, align: "right", characterSpacing: 1.4 });
  doc.fillColor(INK).font(FONT_BOLD).fontSize(14);
  doc.text(snap.nextAffirmationDue, PAGE_W - MARGIN - 200, y + 19, { width: 190, align: "right" });
}

function drawFooter(doc: PDFKit.PDFDocument, snap: ExecutiveBriefSnapshot) {
  const y = PAGE_H - 30;
  doc.save();
  doc.lineWidth(0.4).strokeColor(INK_SOFT);
  doc.moveTo(MARGIN, y - 6).lineTo(PAGE_W - MARGIN, y - 6).stroke();
  doc.restore();

  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7);
  doc.text(
    `© ${snap.engagement.rpoFirm} — ${snap.engagement.classification} — Generated ${snap.generatedAt.toISOString()}`,
    MARGIN,
    y,
    { width: CONTENT_W - 80 }
  );
  doc.fillColor(BONE_SOFT).font(FONT_REG).fontSize(7);
  doc.text("Page 1 of 1", MARGIN, y, { width: CONTENT_W, align: "right" });
}
