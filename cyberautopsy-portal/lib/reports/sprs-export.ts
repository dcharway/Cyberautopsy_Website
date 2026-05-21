/**
 * SPRS Score JSON Export — submission-ready format with deduction trail.
 */

import { CONTROLS } from "@/data/controls110";
import { sprsScore } from "@/lib/analytics";
import { ORG } from "@/lib/utils";

type Deduction = {
  controlId: string;
  family: string;
  weight: number;
  status: string;
  pointsLost: number;
  reason: string;
};

export function buildSPRSExport() {
  const score = sprsScore(CONTROLS);
  const threshold = 88;
  const deductions: Deduction[] = [];

  for (const c of CONTROLS) {
    let lost = 0;
    let reason = "";
    if (c.status === "Not Implemented" || c.status === "Not Started") {
      lost = c.weight;
      reason = `${c.status}: full weight deducted`;
    } else if (c.status === "Partial") {
      lost = Math.ceil(c.weight / 2);
      reason = `Partial: half weight (ceiling) deducted`;
    }
    if (lost > 0) {
      deductions.push({
        controlId: c.id,
        family: c.family,
        weight: c.weight,
        status: c.status,
        pointsLost: lost,
        reason
      });
    }
  }

  const totalDeduction = deductions.reduce((s, d) => s + d.pointsLost, 0);

  return {
    organization: {
      name: ORG.name,
      cage: ORG.cage,
      systemBoundary: ORG.systemBoundary
    },
    generated: new Date().toISOString(),
    framework: "NIST SP 800-171 Rev. 2 / CMMC Level 2",
    score,
    startingScore: 110,
    totalDeduction,
    threshold,
    passing: score >= threshold,
    deductions,
    summary: {
      controlsTotal: CONTROLS.length,
      implemented: CONTROLS.filter((c) => c.status === "Implemented").length,
      partial: CONTROLS.filter((c) => c.status === "Partial").length,
      notImplemented: CONTROLS.filter((c) => c.status === "Not Implemented").length,
      notStarted: CONTROLS.filter((c) => c.status === "Not Started").length,
      underReview: CONTROLS.filter((c) => c.status === "Under Review").length
    }
  };
}
