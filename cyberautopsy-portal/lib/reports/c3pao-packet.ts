/**
 * C3PAO Assessment Packet ZIP — primary one-click handoff.
 *
 * Bundles:
 *   00_README.txt
 *   01_SSP/SSP_AppendixD_ControlSummary.xlsx
 *   02_POAM/POAM_Workbook.xlsx
 *   03_Evidence/Evidence_Mapping_Matrix.xlsx
 *   04_SPRS/SPRS_Score.json
 *   05_Checklist/CMMC_Assessment_Checklist.xlsx     (PRD §14 first-release)
 *   06_Affirmation/Annual_Affirmation_Statement.xlsx (PRD §14 first-release)
 *   07_Manifest/manifest.json
 *
 * Uses jszip (pure-JS, no webpack/CJS interop pain).
 */

import JSZip from "jszip";
import { buildSSPAppendixD } from "./ssp-appendix-d";
import { buildPOAMWorkbook } from "./poam-workbook";
import { buildEvidenceMatrix } from "./evidence-matrix";
import { buildSPRSExport } from "./sprs-export";
import { buildAssessmentChecklist } from "./checklist";
import { buildAffirmationStatement } from "./affirmation";
import { CONTROLS } from "@/data/controls110";
import { POAMS } from "@/data/poam";
import { sprsScore } from "@/lib/analytics";
import { loadEngagement, type Engagement } from "@/lib/engagement";
import { isoDate } from "./common";

export async function buildC3PAOPacket(): Promise<Buffer> {
  const e = await loadEngagement();

  const [sspBuf, poamBuf, evidBuf, checklistBuf, affBuf, sprs] = await Promise.all([
    buildSSPAppendixD(),
    buildPOAMWorkbook(),
    buildEvidenceMatrix(),
    buildAssessmentChecklist(),
    buildAffirmationStatement(),
    buildSPRSExport()
  ]);

  const readme = buildReadme(e);
  const manifest = buildManifest(e, {
    sspSize: sspBuf.length,
    poamSize: poamBuf.length,
    evidSize: evidBuf.length,
    checklistSize: checklistBuf.length,
    affSize: affBuf.length
  });

  const zip = new JSZip();
  zip.file("00_README.txt", readme);
  zip.file("01_SSP/SSP_AppendixD_ControlSummary.xlsx", sspBuf);
  zip.file("02_POAM/POAM_Workbook.xlsx", poamBuf);
  zip.file("03_Evidence/Evidence_Mapping_Matrix.xlsx", evidBuf);
  zip.file("04_SPRS/SPRS_Score.json", JSON.stringify(sprs, null, 2));
  zip.file("05_Checklist/CMMC_Assessment_Checklist.xlsx", checklistBuf);
  zip.file("06_Affirmation/Annual_Affirmation_Statement.xlsx", affBuf);
  zip.file("07_Manifest/manifest.json", JSON.stringify(manifest, null, 2));

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });
}

function buildReadme(e: Engagement): string {
  const score = sprsScore(CONTROLS);
  return [
    "CYBERAUTOPSY · CMMC LEVEL 2 ASSESSMENT PACKET",
    "==============================================",
    "",
    `Organization        : ${e.organizationLegal}`,
    `CAGE Code           : ${e.cage}`,
    `System Boundary     : ${e.systemBoundary}`,
    `Reporting Period    : ${e.reportingPeriod}`,
    `Lead Assessor       : ${e.assessor}`,
    `RPO Firm            : ${e.rpoFirm}`,
    `C3PAO of Record     : ${e.c3paoFirm}`,
    `Affirming Official  : ${e.affirmingOfficial} (${e.affirmingOfficialTitle})`,
    `Generated           : ${new Date().toISOString()}`,
    `Document Version    : ${e.documentVersion}`,
    `Classification      : ${e.classification}`,
    "",
    "PACKET SNAPSHOT",
    "---------------",
    `SPRS Score          : ${score} of 110 (threshold 88 — ${score >= 88 ? "PASS" : "FAIL"})`,
    `Total Controls      : ${CONTROLS.length}`,
    `Open POA&Ms         : ${POAMS.filter((p) => p.status !== "Closed").length}`,
    `Last Affirmation    : ${e.lastAffirmation ?? "—"}`,
    `Next Affirmation Due: ${e.nextAffirmationDue}`,
    "",
    "CONTENTS",
    "--------",
    "01_SSP/         — System Security Plan, Appendix D Control Summary (xlsx)",
    "02_POAM/        — Plan of Action & Milestones, DoD-format workbook (xlsx)",
    "03_Evidence/    — Evidence Mapping Matrix with C3PAO-style file naming (xlsx)",
    "04_SPRS/        — SPRS submission score, deduction trail per control (json)",
    "05_Checklist/   — CMMC Assessment Checklist: 110-control walkthrough with",
    "                  assessor verdict / findings / sign-off (xlsx)",
    "06_Affirmation/ — Annual Affirmation Statement per 32 CFR §170.22 (xlsx)",
    "07_Manifest/    — Generation manifest with source metadata (json)",
    "",
    "INSTRUCTIONS FOR C3PAO",
    "----------------------",
    "1. Open 05_Checklist/CMMC_Assessment_Checklist.xlsx and walk the 110 controls.",
    "   Record verdict + notes in-place; the workbook is preformatted with dropdowns.",
    "2. Open 01_SSP/SSP_AppendixD_ControlSummary.xlsx for the OSC's narrative position",
    "   on each control. Cross-reference 03_Evidence/Evidence_Mapping_Matrix.xlsx for",
    "   artifact pointers (file names follow ControlID_Description_YYYY-MM-DD.ext).",
    "3. 02_POAM/POAM_Workbook.xlsx covers open gap items with risk ratings and the",
    "   180-day closure clock required by CMMC 2.0.",
    "4. 04_SPRS/SPRS_Score.json is the deduction trail behind the score the OSC will",
    "   submit to SPRS.",
    "5. 06_Affirmation/Annual_Affirmation_Statement.xlsx is preformatted for the",
    "   affirming senior officer's signature and the RPO countersignature.",
    "6. Findings or clarification requests: contact the engagement Compliance Surgeon",
    `   listed in the engagement letter (${e.assessor}, ${e.rpoFirm}).`,
    "",
    "AUTHENTICITY",
    "------------",
    "This packet is generated directly from the CyberAutopsy GRC portal at the time stamp",
    "above. Every document carries the CyberAutopsy header watermark on every page and",
    "every sheet. Any divergence from the live portal state implies tampering or stale",
    "generation.",
    "",
    `Document version : ${e.documentVersion} (${isoDate()})`,
    `Classification   : ${e.classification}`,
    "Distribution     : Limited to the named C3PAO and DoD Sponsoring Office."
  ].join("\n");
}

function buildManifest(
  e: Engagement,
  sizes: {
    sspSize: number;
    poamSize: number;
    evidSize: number;
    checklistSize: number;
    affSize: number;
  }
) {
  return {
    packetVersion: "1.1",
    generatedAt: new Date().toISOString(),
    generator: "CyberAutopsy GRC Portal",
    framework: "NIST SP 800-171 Rev. 2 / CMMC Level 2",
    organization: {
      name: e.organizationLegal,
      cage: e.cage,
      duns: e.ducns ?? null,
      systemBoundary: e.systemBoundary
    },
    engagement: {
      assessor: e.assessor,
      rpoFirm: e.rpoFirm,
      c3paoFirm: e.c3paoFirm,
      reportingPeriod: e.reportingPeriod,
      documentVersion: e.documentVersion,
      classification: e.classification
    },
    affirmation: {
      affirmingOfficial: e.affirmingOfficial,
      affirmingOfficialTitle: e.affirmingOfficialTitle,
      lastAffirmation: e.lastAffirmation,
      nextAffirmationDue: e.nextAffirmationDue
    },
    contents: [
      { path: "00_README.txt",                                       kind: "text" },
      { path: "01_SSP/SSP_AppendixD_ControlSummary.xlsx",            kind: "xlsx", sizeBytes: sizes.sspSize },
      { path: "02_POAM/POAM_Workbook.xlsx",                          kind: "xlsx", sizeBytes: sizes.poamSize },
      { path: "03_Evidence/Evidence_Mapping_Matrix.xlsx",            kind: "xlsx", sizeBytes: sizes.evidSize },
      { path: "04_SPRS/SPRS_Score.json",                             kind: "json" },
      { path: "05_Checklist/CMMC_Assessment_Checklist.xlsx",         kind: "xlsx", sizeBytes: sizes.checklistSize },
      { path: "06_Affirmation/Annual_Affirmation_Statement.xlsx",    kind: "xlsx", sizeBytes: sizes.affSize },
      { path: "07_Manifest/manifest.json",                           kind: "json" }
    ],
    snapshotCounts: {
      controls: CONTROLS.length,
      sprsScore: sprsScore(CONTROLS),
      poams: POAMS.length,
      openPOAMs: POAMS.filter((p) => p.status !== "Closed").length
    }
  };
}
