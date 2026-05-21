import type { Control, ControlStatus, FamilyCode } from "./types";

export function countByStatus(controls: Control[]): Record<ControlStatus, number> {
  const init: Record<ControlStatus, number> = {
    Implemented: 0,
    Partial: 0,
    "Not Implemented": 0,
    "Not Applicable": 0,
    "Not Started": 0,
    "Under Review": 0
  };
  return controls.reduce((acc, c) => ({ ...acc, [c.status]: acc[c.status] + 1 }), init);
}

export function sprsScore(controls: Control[]): number {
  // SPRS: starts at 110, subtracts the weight for each Not Implemented control.
  // Partial counts as half the weight (conservative — assessors apply per-objective).
  const deduction = controls.reduce((sum, c) => {
    if (c.status === "Not Implemented") return sum + c.weight;
    if (c.status === "Partial") return sum + Math.ceil(c.weight / 2);
    if (c.status === "Not Started") return sum + c.weight;
    return sum;
  }, 0);
  return 110 - deduction;
}

export function familyPosture(controls: Control[]) {
  const map = new Map<FamilyCode, { total: number; impl: number; partial: number; missing: number; review: number; naps: number }>();
  for (const c of controls) {
    const prev = map.get(c.family) ?? { total: 0, impl: 0, partial: 0, missing: 0, review: 0, naps: 0 };
    prev.total++;
    if (c.status === "Implemented") prev.impl++;
    else if (c.status === "Partial") prev.partial++;
    else if (c.status === "Not Implemented" || c.status === "Not Started") prev.missing++;
    else if (c.status === "Under Review") prev.review++;
    else prev.naps++;
    map.set(c.family, prev);
  }
  return map;
}

export type FamilySeverity = "met" | "partial" | "failed" | "review";

export function familySeverity(p: { total: number; impl: number; partial: number; missing: number; review: number }): FamilySeverity {
  const implRatio = p.impl / p.total;
  if (p.missing >= 2) return "failed";
  if (p.review >= 1 && p.partial === 0 && p.missing === 0) return "review";
  if (implRatio >= 0.85) return "met";
  return "partial";
}
