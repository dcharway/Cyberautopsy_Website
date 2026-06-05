import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadActive } from "@/lib/assessments";
import { loadPreCMMC, patchPreCMMCState, computeReadiness } from "@/lib/precmmc-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveAssessmentId(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("assessmentId");
  if (fromQuery) return fromQuery;
  return (await loadActive()).assessmentId;
}

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }
  const state = await loadPreCMMC(assessmentId);
  return NextResponse.json({ state, readiness: computeReadiness(state) });
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
  const state = await patchPreCMMCState(
    assessmentId,
    {
      header: body.header,
      items: body.items,
      freeNotes: typeof body.freeNotes === "string" ? body.freeNotes : undefined
    },
    updatedBy
  );
  return NextResponse.json({ state, readiness: computeReadiness(state) });
}
