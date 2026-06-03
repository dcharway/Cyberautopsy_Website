/**
 * Risk model + summary metrics that back the Executive Brief PDF.
 *
 * The brief is one page, so this module collapses live portal state into a
 * board-ready snapshot:
 *   - SPRS score + threshold + pass/fail
 *   - Controls met / partial / missing breakdown
 *   - Top 5 risks (open POA&Ms and unaddressed weight-5 controls, ranked)
 *   - Days remaining until next affirmation due
 *   - Affirmation status (current / overdue)
 *
 * Risk ranking model — higher score = surfaced first:
 *   - Open POA&M on weight-5 control            +50  (regulatory blocker)
 *   - Weight-5 control Not Implemented, no POA&M +60 (cannot be POA&M'd per
 *                                                     CMMC 2.0; certificate-blocking)
 *   - Risk=High +25 · Risk=Medium +12 · Risk=Low +4
 *   - Status=Open +10 · In Remediation +5 · Pending Review +2
 *   - Days to close < 0   +20  (overdue)
 *   - Days to close < 14  +10  (imminent)
 *   - Days to close < 30  +5
 *
 * The model is deliberately additive + transparent so the assessor can
 * defend the prioritisation to the C-suite.
 */

import { CONTROLS } from "@/data/controls110";
import { sprsScore, countByStatus } from "@/lib/analytics";
import { mergedControls } from "@/lib/control-state";
import { listPOAMs, type POAMItem } from "@/lib/poam-store";
import { loadActive } from "@/lib/assessments";
import { loadEngagement, type Engagement } from "@/lib/engagement";
import type { Control } from "@/lib/types";

export type RiskItem = {
  rank: number;
  score: number;
  controlId: string;
  controlName: string;
  family: string;
  weight: number;
  title: string;          // 1-line headline for the brief
  driver: string;         // why it's ranked (assessor's defence)
  impact: string;         // board-language consequence
  status: "Open POA&M" | "Weight-5 unaddressed" | "Stalled POA&M" | "Overdue POA&M";
  ownerLabel: string;
};

export type ExecutiveBriefSnapshot = {
  engagement: Engagement;
  generatedAt: Date;

  // Score
  sprsScore: number;
  sprsThreshold: 88;
  sprsPassing: boolean;
  sprsDeduction: number;

  // Controls breakdown
  controlsTotal: number;
  controlsMet: number;
  controlsPartial: number;
  controlsMissing: number;
  controlsUnderReview: number;
  controlsNotApplicable: number;

  // POA&M roll-up
  poamsTotal: number;
  poamsOpen: number;
  poamsInRemediation: number;
  poamsPendingReview: number;
  poamsClosed: number;
  poamsOverdue: number;

  // Affirmation
  nextAffirmationDue: string;          // ISO date
  daysToAffirmation: number;           // negative = overdue
  affirmationStatus: "Current" | "Due soon" | "Overdue";

  // Top 5 risks (sorted highest first)
  topRisks: RiskItem[];

  // Narrative — board-room paragraph
  executiveNarrative: string;
};

export async function buildExecutiveBriefSnapshot(): Promise<ExecutiveBriefSnapshot> {
  const engagement = await loadEngagement();
  const active = await loadActive();

  const controls: Control[] = active.assessmentId
    ? await mergedControls(active.assessmentId)
    : CONTROLS;
  const poams: POAMItem[] = active.assessmentId ? await listPOAMs(active.assessmentId) : [];

  const score = sprsScore(controls);
  const statusCounts = countByStatus(controls);

  const controlsMet = statusCounts.Implemented ?? 0;
  const controlsPartial = statusCounts.Partial ?? 0;
  const controlsMissing =
    (statusCounts["Not Implemented"] ?? 0) + (statusCounts["Not Started"] ?? 0);
  const controlsUnderReview = statusCounts["Under Review"] ?? 0;
  const controlsNotApplicable = statusCounts["Not Applicable"] ?? 0;

  const poamsByStatus = (s: POAMItem["status"]) => poams.filter((p) => p.status === s).length;
  const now = Date.now();
  const poamsOverdue = poams.filter(
    (p) => p.status !== "Closed" && new Date(p.scheduledClose).getTime() < now
  ).length;

  // Affirmation
  const due = new Date(engagement.nextAffirmationDue);
  const daysToAffirmation = Math.ceil((due.getTime() - now) / (1000 * 60 * 60 * 24));
  const affirmationStatus: ExecutiveBriefSnapshot["affirmationStatus"] =
    daysToAffirmation < 0 ? "Overdue" : daysToAffirmation < 60 ? "Due soon" : "Current";

  const topRisks = rankTopRisks(controls, poams);

  return {
    engagement,
    generatedAt: new Date(),
    sprsScore: score,
    sprsThreshold: 88,
    sprsPassing: score >= 88,
    sprsDeduction: 110 - score,
    controlsTotal: controls.length,
    controlsMet,
    controlsPartial,
    controlsMissing,
    controlsUnderReview,
    controlsNotApplicable,
    poamsTotal: poams.length,
    poamsOpen: poamsByStatus("Open"),
    poamsInRemediation: poamsByStatus("In Remediation"),
    poamsPendingReview: poamsByStatus("Pending Review"),
    poamsClosed: poamsByStatus("Closed"),
    poamsOverdue,
    nextAffirmationDue: engagement.nextAffirmationDue,
    daysToAffirmation,
    affirmationStatus,
    topRisks,
    executiveNarrative: buildNarrative({
      org: engagement.organization,
      score,
      passing: score >= 88,
      controlsTotal: controls.length,
      controlsMet,
      controlsMissing,
      poamsOpen: poamsByStatus("Open") + poamsByStatus("In Remediation") + poamsByStatus("Pending Review"),
      poamsOverdue,
      daysToAffirmation,
      affirmationStatus
    })
  };
}

/* ---------- risk ranking ---------- */

function rankTopRisks(controls: Control[], poams: POAMItem[]): RiskItem[] {
  const now = Date.now();
  const controlById = new Map(controls.map((c) => [c.id, c]));
  const candidates: Array<RiskItem & { _key: string }> = [];

  // 1) Open POA&Ms
  for (const p of poams) {
    if (p.status === "Closed") continue;
    const ctrl = controlById.get(p.controlId);
    const weight = ctrl?.weight ?? 1;
    const days = Math.ceil((new Date(p.scheduledClose).getTime() - now) / 86400_000);

    let score = 0;
    if (weight === 5) score += 50;
    if (p.risk === "High") score += 25;
    else if (p.risk === "Medium") score += 12;
    else score += 4;
    if (p.status === "Open") score += 10;
    else if (p.status === "In Remediation") score += 5;
    else if (p.status === "Pending Review") score += 2;
    if (days < 0) score += 20;
    else if (days < 14) score += 10;
    else if (days < 30) score += 5;

    const status: RiskItem["status"] =
      days < 0 ? "Overdue POA&M" : p.status === "Open" ? "Open POA&M" : "Stalled POA&M";

    const dueLine = days < 0
      ? `${Math.abs(days)} days past due`
      : days === 0
      ? "due today"
      : `${days} days to close`;

    candidates.push({
      _key: `poam:${p.id}`,
      rank: 0,
      score,
      controlId: p.controlId,
      controlName: ctrl?.name ?? p.controlId,
      family: ctrl?.family ?? p.controlId.split(".")[0] ?? "—",
      weight,
      title: truncate(p.weakness, 110),
      driver: `Open POA&M ${p.id} · ${p.risk} risk · ${dueLine}${weight === 5 ? " · weight-5 control" : ""}`,
      impact: boardImpactForPoam(p, weight, days),
      status,
      ownerLabel: p.owner
    });
  }

  // 2) Weight-5 controls that are Not Implemented and have no POA&M
  const poamControlIds = new Set(poams.filter((p) => p.status !== "Closed").map((p) => p.controlId));
  for (const c of controls) {
    if (c.weight !== 5) continue;
    if (c.status === "Implemented" || c.status === "Not Applicable") continue;
    if (poamControlIds.has(c.id)) continue;

    candidates.push({
      _key: `ctrl:${c.id}`,
      rank: 0,
      score: 60 + (c.status === "Not Implemented" ? 5 : 0),
      controlId: c.id,
      controlName: c.name,
      family: c.family,
      weight: c.weight,
      title: `Weight-5 control ${c.id} is ${c.status} — CMMC 2.0 bars POA&Ms here`,
      driver: `Weight-5, ${c.status} · POA&M not permitted on weight-5 controls`,
      impact:
        "Certificate-blocking. The full 5-point deduction holds against SPRS and the C3PAO cannot recommend certification.",
      status: "Weight-5 unaddressed",
      ownerLabel: c.owner ?? "Unassigned"
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 5).map((r, i) => {
    const { _key: _k, ...rest } = r;
    void _k;
    return { ...rest, rank: i + 1 };
  });
}

function boardImpactForPoam(p: POAMItem, weight: number, days: number): string {
  if (weight === 5) {
    return `Costs ${weight} SPRS points until closed and (per CMMC 2.0) cannot be POA&M-mitigated long-term — closure required before certification.`;
  }
  if (days < 0) {
    return `${Math.abs(days)} days past the scheduled close. Open POA&Ms past their deadline can void the affirmation. Demands an owner check-in this week.`;
  }
  if (p.risk === "High") {
    return `High-risk gap on a ${weight}-point control. If left open through certification, costs ${Math.ceil(weight / 2)} SPRS points and surfaces in the C3PAO findings letter.`;
  }
  return `${weight}-point control gap. Closing before certification preserves SPRS posture and avoids carrying the item into the next reporting period.`;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

/* ---------- narrative ---------- */

function buildNarrative(p: {
  org: string;
  score: number;
  passing: boolean;
  controlsTotal: number;
  controlsMet: number;
  controlsMissing: number;
  poamsOpen: number;
  poamsOverdue: number;
  daysToAffirmation: number;
  affirmationStatus: "Current" | "Due soon" | "Overdue";
}): string {
  const pctMet = Math.round((p.controlsMet / p.controlsTotal) * 100);
  const scoreSentence = p.passing
    ? `Posture is above the SPRS threshold of 88 with a current score of ${p.score}, supporting an audit-ready trajectory.`
    : `Posture is below the SPRS threshold of 88 — current score ${p.score}. ${88 - p.score} points must be recovered through control implementation or POA&M closure before the C3PAO is engaged.`;

  const controlSentence = `${p.controlsMet} of ${p.controlsTotal} controls (${pctMet}%) are fully implemented; ${p.controlsMissing} remain unaddressed.`;

  let poamSentence: string;
  if (p.poamsOverdue > 0) {
    poamSentence = `${p.poamsOpen} POA&Ms are in flight, of which ${p.poamsOverdue} ${p.poamsOverdue === 1 ? "is" : "are"} past the scheduled close date and warrant immediate ownership.`;
  } else if (p.poamsOpen > 0) {
    poamSentence = `${p.poamsOpen} POA&Ms are in flight on track within their closure clocks.`;
  } else {
    poamSentence = `No open POA&Ms remain in this reporting period — the assessment is in a clean state for the affirming officer.`;
  }

  let affirmationSentence: string;
  if (p.affirmationStatus === "Overdue") {
    affirmationSentence = `The annual affirmation under 32 CFR §170.22 is ${Math.abs(p.daysToAffirmation)} days overdue and must be filed without further delay.`;
  } else if (p.affirmationStatus === "Due soon") {
    affirmationSentence = `The annual affirmation under 32 CFR §170.22 is due in ${p.daysToAffirmation} days — recommend scheduling the affirming-officer signing within the next two weeks.`;
  } else {
    affirmationSentence = `The annual affirmation under 32 CFR §170.22 is current; the next filing is due in ${p.daysToAffirmation} days.`;
  }

  return `${p.org}'s CMMC Level 2 readiness is reported as follows. ${scoreSentence} ${controlSentence} ${poamSentence} ${affirmationSentence}`;
}
