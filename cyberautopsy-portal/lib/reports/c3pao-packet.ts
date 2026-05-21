/**
 * C3PAO Assessment Packet ZIP — primary one-click handoff.
 *
 * Bundles:
 *   00_README.txt
 *   01_SSP/SSP_AppendixD_ControlSummary.xlsx
 *   02_POAM/POAM_Workbook.xlsx
 *   03_Evidence/Evidence_Mapping_Matrix.xlsx
 *   04_SPRS/SPRS_Score.json
 *   05_Manifest/manifest.json
 *
 * Uses jszip (pure-JS, no webpack/CJS interop pain).
 */

import JSZip from "jszip";
import { buildSSPAppendixD } from "./ssp-appendix-d";
import { buildPOAMWorkbook } from "./poam-workbook";
import { buildEvidenceMatrix } from "./evidence-matrix";
import { buildSPRSExport } from "./sprs-export";
import { CONTROLS } from "@/data/controls110";
import { POAMS } from "@/data/poam";
import { sprsScore } from "@/lib/analytics";
import { ORG } from "@/lib/utils";
import { isoDate } from "./common";

export async function buildC3PAOPacket(): Promise<Buffer> {
  const [sspBuf, poamBuf, evidBuf] = await Promise.all([
    buildSSPAppendixD(),
    buildPOAMWorkbook(),
    buildEvidenceMatrix()
  ]);

  const sprs = buildSPRSExport();
  const readme = buildReadme();
  const manifest = buildManifest({
    sspSize: sspBuf.length,
    poamSize: poamBuf.length,
    evidSize: evidBuf.length
  });

  const zip = new JSZip();
  zip.file("00_README.txt", readme);
  zip.file("01_SSP/SSP_AppendixD_ControlSummary.xlsx", sspBuf);
  zip.file("02_POAM/POAM_Workbook.xlsx", poamBuf);
  zip.file("03_Evidence/Evidence_Mapping_Matrix.xlsx", evidBuf);
  zip.file("04_SPRS/SPRS_Score.json", JSON.stringify(sprs, null, 2));
  zip.file("05_Manifest/manifest.json", JSON.stringify(manifest, null, 2));

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });
}

function buildReadme(): string {
  const score = sprsScore(CONTROLS);
  return [
    "CYBERAUTOPSY · CMMC LEVEL 2 ASSESSMENT PACKET",
    "==============================================",
    "",
    `Organization     : ${ORG.name}`,
    `CAGE Code        : ${ORG.cage}`,
    `System Boundary  : ${ORG.systemBoundary}`,
    `C3PAO of Record  : ${ORG.c3pao}`,
    `Active Assessment: ${ORG.activeAssessment}`,
    `Generated        : ${new Date().toISOString()}`,
    "",
    "PACKET SNAPSHOT",
    "---------------",
    `SPRS Score       : ${score} of 110 (threshold 88 — ${score >= 88 ? "PASS" : "FAIL"})`,
    `Total Controls   : ${CONTROLS.length}`,
    `Open POA&Ms      : ${POAMS.filter((p) => p.status !== "Closed").length}`,
    "",
    "CONTENTS",
    "--------",
    "01_SSP/        — System Security Plan, Appendix D Control Summary (xlsx)",
    "02_POAM/       — Plan of Action & Milestones, DoD-format workbook (xlsx)",
    "03_Evidence/   — Evidence Mapping Matrix with C3PAO-style file naming (xlsx)",
    "04_SPRS/       — SPRS submission score, deduction trail per control (json)",
    "05_Manifest/   — Generation manifest with source metadata (json)",
    "",
    "INSTRUCTIONS FOR C3PAO",
    "----------------------",
    "1. Open 01_SSP/SSP_AppendixD_ControlSummary.xlsx and review the Control Summary",
    "   sheet. Filter on Status column to surface controls that warrant deeper read.",
    "2. Cross-reference 03_Evidence/Evidence_Mapping_Matrix.xlsx for artifact pointers",
    "   per control. File names follow ControlID_Description_YYYY-MM-DD.ext convention.",
    "3. 02_POAM/POAM_Workbook.xlsx covers gap items with risk ratings and 180-day clocks.",
    "4. 04_SPRS/SPRS_Score.json is the deduction trail behind the score.",
    "5. Findings or clarification requests: contact the engagement Compliance Surgeon listed in",
    "   the engagement letter.",
    "",
    "AUTHENTICITY",
    "------------",
    "This packet is generated directly from the CyberAutopsy GRC portal at the time stamp",
    "above. Any divergence from the live portal state implies tampering or stale generation.",
    "",
    `Document version : v1.0 (${isoDate()})`,
    "Classification   : Controlled Unclassified Information (CUI)",
    "Distribution     : Limited to the named C3PAO and DoD Sponsoring Office."
  ].join("\n");
}

function buildManifest(sizes: { sspSize: number; poamSize: number; evidSize: number }) {
  return {
    packetVersion: "1.0",
    generatedAt: new Date().toISOString(),
    generator: "CyberAutopsy GRC Portal",
    framework: "NIST SP 800-171 Rev. 2 / CMMC Level 2",
    organization: {
      name: ORG.name,
      cage: ORG.cage,
      systemBoundary: ORG.systemBoundary,
      c3pao: ORG.c3pao
    },
    contents: [
      { path: "00_README.txt",                                kind: "text" },
      { path: "01_SSP/SSP_AppendixD_ControlSummary.xlsx",     kind: "xlsx", sizeBytes: sizes.sspSize },
      { path: "02_POAM/POAM_Workbook.xlsx",                   kind: "xlsx", sizeBytes: sizes.poamSize },
      { path: "03_Evidence/Evidence_Mapping_Matrix.xlsx",     kind: "xlsx", sizeBytes: sizes.evidSize },
      { path: "04_SPRS/SPRS_Score.json",                      kind: "json" },
      { path: "05_Manifest/manifest.json",                    kind: "json" }
    ],
    snapshotCounts: {
      controls: CONTROLS.length,
      sprsScore: sprsScore(CONTROLS),
      poams: POAMS.length,
      openPOAMs: POAMS.filter((p) => p.status !== "Closed").length
    }
  };
}
