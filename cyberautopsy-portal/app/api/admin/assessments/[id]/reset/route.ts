/**
 * POST /api/admin/assessments/[id]/reset
 *
 * Clears all per-assessment data inputs while preserving:
 *   - the Assessment record itself (engagement metadata, dates, parties)
 *   - the Client record
 *   - the 110-control framework (seed CONTROLS[])
 *
 * Wipes:
 *   - All POA&M items                  (.data/poam/{id}.json)
 *   - All evidence records             (.data/evidence/{id}.json)
 *   - All control overrides            (.data/controls/{id}.json)
 *     (status, owner, narrative, assessor notes, acceptable-evidence
 *     review checkboxes)
 *
 * Requires the request body to echo the assessment id as `confirm` so
 * accidental DELETE-style mistakes don't wipe a real client engagement.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { getAssessment, updateAssessment } from "@/lib/assessments";
import { clearPOAMs } from "@/lib/poam-store";
import { clearEvidence } from "@/lib/evidence-store";
import { clearAssessmentOverrides } from "@/lib/control-state";
import { clearPreCMMC } from "@/lib/precmmc-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

export async function POST(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const assessment = await getAssessment(params.id);
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  if (body.confirm !== params.id) {
    return NextResponse.json(
      {
        error: "Confirmation token did not match. Pass { confirm: <assessmentId> } in the body.",
        expected: params.id
      },
      { status: 400 }
    );
  }

  const resetBy = req.headers.get("x-cyber-user") ?? "admin";

  // Wipe per-assessment stores in parallel. The seed control framework + the
  // assessment metadata itself are never touched. Pre-CMMC checklist state +
  // its uploaded artifact bytes are wiped along with the rest.
  await Promise.all([
    clearPOAMs(params.id),
    clearEvidence(params.id),
    clearAssessmentOverrides(params.id),
    clearPreCMMC(params.id)
  ]);

  // Stamp a reset note on the assessment so the audit trail records what
  // happened, then keep status = Active so the user can immediately re-enter
  // data into the clean baseline.
  const stamped = await updateAssessment(
    params.id,
    {
      notes:
        (assessment.notes ? `${assessment.notes}\n` : "") +
        `[${new Date().toISOString()}] Assessment reset to clean baseline by ${resetBy}.`
    },
    resetBy
  );

  return NextResponse.json({
    ok: true,
    assessmentId: params.id,
    resetAt: new Date().toISOString(),
    resetBy,
    cleared: { poams: true, evidence: true, controlOverrides: true, precmmcChecklist: true },
    preserved: { assessmentMetadata: true, clientRecord: true, controlFramework: true, precmmcSchema: true },
    assessment: stamped
  });
}
