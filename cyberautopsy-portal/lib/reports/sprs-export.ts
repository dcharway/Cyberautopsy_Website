/**
 * SPRS Score JSON Export — submission-ready format with deduction trail.
 *
 * Pulls organization metadata from the live engagement record so renaming
 * the client in /admin/engagement is reflected in the submission JSON.
 */

import { CONTROLS } from "@/data/controls110";
import { sprsScore } from "@/lib/analytics";
import { loadEngagement } from "@/lib/engagement";

type Deduction = {
  controlId: string;
  family: string;
  weight: number;
  status: string;
  pointsLost: number;
  reason: string;
};

export async function buildSPRSExport() {
  const e = await loadEngagement();
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
    },
    branding: {
      issuer: "CyberAutopsy GRC Portal",
      watermark: "CYBERAUTOPSY · CMMC L2 ASSESSMENT",
      classification: e.classification
    }
  };
}
