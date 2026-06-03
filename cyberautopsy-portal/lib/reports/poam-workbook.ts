/**
 * POA&M Workbook
 *
 * Three sheets: Cover, POA&M Items, Summary, CMMC 2.0 Rules.
 */

import ExcelJS from "exceljs";
import { POAMS } from "@/data/poam";
import { loadEngagement } from "@/lib/engagement";
import {
  BRAND,
  applyWatermark,
  styleHeaderRow,
  styleDataRow,
  writeCoverSheet,
  isoDate
} from "./common";

const RISK_FILL: Record<string, string> = {
  High: "FFFCE7E7",
  Medium: "FFFEF4E6",
  Low: "FFE6F5EC"
};
const RISK_FONT: Record<string, string> = {
  High: BRAND.red,
  Medium: BRAND.amber,
  Low: BRAND.green
};

const STATUS_FILL: Record<string, string> = {
  Open: "FFFCE7E7",
  "In Remediation": "FFFEF4E6",
  "Pending Review": "FFE6EEFB",
  Closed: "FFE6F5EC"
};
const STATUS_FONT: Record<string, string> = {
  Open: BRAND.red,
  "In Remediation": BRAND.amber,
  "Pending Review": BRAND.blue,
  Closed: BRAND.green
};

export async function buildPOAMWorkbook(): Promise<Buffer> {
  const e = await loadEngagement();
  const wb = new ExcelJS.Workbook();
  wb.creator = "CyberAutopsy GRC Portal";
  wb.created = new Date();

  /* ---------- Cover ---------- */
  const cover = wb.addWorksheet("Cover", { properties: { tabColor: { argb: BRAND.gold } } });
  writeCoverSheet(
    cover,
    "Plan of Action & Milestones",
    "DoD-format POA&M · CMMC Level 2 · 180-day closure clock",
    [
      ["Organization", e.organizationLegal],
      ["CAGE code", e.cage],
      ["System boundary", e.systemBoundary],
      ["Reporting period", e.reportingPeriod],
      ["Lead assessor", e.assessor],
      ["Generated", new Date().toLocaleString("en-US", { timeZoneName: "short" })],
      ["Document version", `${e.documentVersion} (${isoDate()})`],
      ["Total POA&M items", String(POAMS.length)],
      ["Closure obligation", "180 days from certification (CMMC 2.0)"],
      ["Classification", e.classification]
    ]
  );

  /* ---------- POA&M Items ---------- */
  const ws = wb.addWorksheet("POA&M Items");
  ws.columns = [
    { header: "POA&M ID",                key: "id",                width: 12 },
    { header: "Control ID",              key: "controlId",         width: 10 },
    { header: "Weakness / Deficiency",   key: "weakness",          width: 60 },
    { header: "Risk",                    key: "risk",              width: 10 },
    { header: "Remediation Plan",        key: "remediationPlan",   width: 60 },
    { header: "Opened",                  key: "opened",            width: 12 },
    { header: "Scheduled Close",         key: "scheduledClose",    width: 14 },
    { header: "Days to Close",           key: "daysToClose",       width: 12 },
    { header: "Status",                  key: "status",            width: 16 },
    { header: "Owner",                   key: "owner",             width: 14 },
    { header: "Comments",                key: "comments",          width: 40 }
  ];

  const now = Date.now();
  POAMS.forEach((p) => {
    const daysToClose = Math.ceil((new Date(p.scheduledClose).getTime() - now) / (1000 * 60 * 60 * 24));
    ws.addRow({
      id: p.id,
      controlId: p.controlId,
      weakness: p.weakness,
      risk: p.risk,
      remediationPlan: p.remediationPlan,
      opened: p.opened,
      scheduledClose: p.scheduledClose,
      daysToClose,
      status: p.status,
      owner: p.owner,
      comments: p.comments ?? ""
    });
  });

  styleHeaderRow(ws, 1);
  ws.views = [{ state: "frozen", ySplit: 1 }];

  for (let i = 2; i <= POAMS.length + 1; i++) {
    styleDataRow(ws, i);
    ws.getRow(i).height = 36;

    // Risk cell
    const risk = ws.getCell(i, 4).value as string;
    if (risk) {
      ws.getCell(i, 4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: RISK_FILL[risk] } };
      ws.getCell(i, 4).font = { name: "Calibri", size: 9, bold: true, color: { argb: RISK_FONT[risk] } };
      ws.getCell(i, 4).alignment = { vertical: "middle", horizontal: "center" };
    }

    // Days to close — red if past due or <14 days
    const daysCell = ws.getCell(i, 8);
    const days = daysCell.value as number;
    if (typeof days === "number") {
      if (days < 0) {
        daysCell.font = { name: "Calibri", size: 9, bold: true, color: { argb: BRAND.red } };
      } else if (days < 14) {
        daysCell.font = { name: "Calibri", size: 9, bold: true, color: { argb: BRAND.amber } };
      }
      daysCell.alignment = { vertical: "middle", horizontal: "center" };
    }

    // Status cell
    const status = ws.getCell(i, 9).value as string;
    if (status) {
      ws.getCell(i, 9).fill = { type: "pattern", pattern: "solid", fgColor: { argb: STATUS_FILL[status] } };
      ws.getCell(i, 9).font = { name: "Calibri", size: 9, bold: true, color: { argb: STATUS_FONT[status] } };
      ws.getCell(i, 9).alignment = { vertical: "middle", horizontal: "center" };
    }
  }

  // Validations — runtime API, missing from exceljs d.ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dv = (ws as any).dataValidations;
  dv.add(`D2:D${POAMS.length + 1}`, {
    type: "list",
    allowBlank: false,
    formulae: ['"Low,Medium,High"']
  });
  dv.add(`I2:I${POAMS.length + 1}`, {
    type: "list",
    allowBlank: false,
    formulae: ['"Open,In Remediation,Pending Review,Closed"']
  });

  /* ---------- Summary ---------- */
  const summary = wb.addWorksheet("Summary", { properties: { tabColor: { argb: BRAND.gold } } });
  summary.columns = [{ width: 32 }, { width: 14 }];

  const total = POAMS.length;
  const byStatus = (s: string) => POAMS.filter((p) => p.status === s).length;
  const byRisk = (r: string) => POAMS.filter((p) => p.risk === r).length;
  const pastDue = POAMS.filter((p) => new Date(p.scheduledClose).getTime() < now).length;
  const avgAge = Math.round(
    POAMS.reduce((s, p) => s + (now - new Date(p.opened).getTime()) / (1000 * 60 * 60 * 24), 0) / total
  );

  summary.addRow(["AGGREGATE", "Value"]);
  styleHeaderRow(summary, 1);
  summary.addRow(["Total POA&M items", total]);
  summary.addRow(["Past due", pastDue]);
  summary.addRow(["Average age (days)", avgAge]);
  summary.addRow([]);

  const sHeader = summary.addRow(["BY STATUS", "Count"]);
  styleHeaderRow(summary, sHeader.number);
  ["Open", "In Remediation", "Pending Review", "Closed"].forEach((s) => summary.addRow([s, byStatus(s)]));
  summary.addRow([]);

  const rHeader = summary.addRow(["BY RISK", "Count"]);
  styleHeaderRow(summary, rHeader.number);
  ["High", "Medium", "Low"].forEach((r) => summary.addRow([r, byRisk(r)]));

  /* ---------- CMMC 2.0 Rules ---------- */
  const rules = wb.addWorksheet("CMMC 2.0 Rules");
  rules.columns = [{ width: 28 }, { width: 80 }];
  rules.addRow(["RULE", "Description"]);
  styleHeaderRow(rules, 1);
  [
    ["SPRS minimum",      "A computed SPRS score of 88 of 110 is required to enter assessment with a POA&M. Below 88, no POA&M permitted."],
    ["POA&M-eligible",    "Weight-1 controls and a limited subset of weight-3. Weight-5 controls cannot be POA&M'd."],
    ["Closure obligation","180 days from certification. Failure to close suspends the certificate."],
    ["Affirmation tie",   "Annual affirmation must reflect closed POA&Ms or otherwise document residual posture."],
    ["Risk rating",       "Use Low / Medium / High only. DoD does not accept four-tier ratings on POA&Ms."]
  ].forEach(([k, v]) => {
    const r = rules.addRow([k, v]);
    r.height = 36;
    r.eachCell((c) => (c.alignment = { vertical: "middle", wrapText: true }));
  });

  applyWatermark(wb, {
    docTitle: "Plan of Action & Milestones",
    classification: e.classification
  });

  return Buffer.from(await wb.xlsx.writeBuffer());
}
