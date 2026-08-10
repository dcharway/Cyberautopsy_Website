import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadActive } from "@/lib/assessments";
import { loadFCI, patchFCIState } from "@/lib/fci-store";
import { determine } from "@/data/fci-determination";

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
  const state = await loadFCI(assessmentId);
  return NextResponse.json({ state, determination: determine(state.answers) });
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
  const state = await patchFCIState(
    assessmentId,
    {
      header: body.header,
      answers: body.answers,
      rationaleNotes: body.rationaleNotes,
      signatures: body.signatures
    },
    updatedBy
  );
  return NextResponse.json({ state, determination: determine(state.answers) });
}
