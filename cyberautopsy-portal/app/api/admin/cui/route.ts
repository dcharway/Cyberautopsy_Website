import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadActive } from "@/lib/assessments";
import { loadCUI, patchCUIState } from "@/lib/cui-store";
import { determine } from "@/data/cui-determination";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveAssessmentId(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const q = url.searchParams.get("assessmentId");
  if (q) return q;
  return (await loadActive()).assessmentId;
}

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }
  const state = await loadCUI(assessmentId);
  return NextResponse.json({
    state,
    determination: determine(state.answers, state.selectedCategoryCodes)
  });
}

export async function PATCH(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const updatedBy = req.headers.get("x-cyber-user") ?? "admin";
  const state = await patchCUIState(
    assessmentId,
    {
      assetHeader: body.assetHeader,
      answers: body.answers,
      rationaleNotes: body.rationaleNotes,
      selectedCategoryCodes: body.selectedCategoryCodes,
      categoryOtherNote: body.categoryOtherNote,
      signatures: body.signatures
    },
    updatedBy
  );
  return NextResponse.json({
    state,
    determination: determine(state.answers, state.selectedCategoryCodes)
  });
}
