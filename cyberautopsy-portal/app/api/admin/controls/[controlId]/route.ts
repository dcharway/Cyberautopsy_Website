import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { setOverride, getOverride, mergedControls } from "@/lib/control-state";
import { loadActive } from "@/lib/assessments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { controlId: string } };

async function resolveAssessmentId(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("assessmentId");
  if (fromQuery) return fromQuery;
  return (await loadActive()).assessmentId;
}

export async function GET(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  // Return the merged control (seed + override) and the override itself.
  const [merged, override] = await Promise.all([
    mergedControls(assessmentId).then((arr) => arr.find((c) => c.id === params.controlId) ?? null),
    getOverride(assessmentId, params.controlId)
  ]);
  if (!merged) return NextResponse.json({ error: "Control not found" }, { status: 404 });
  return NextResponse.json({ control: merged, override });
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  const assessmentId = body.assessmentId ?? (await resolveAssessmentId(req));
  if (!assessmentId) return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  const updatedBy = req.headers.get("x-cyber-user") ?? "admin";
  const override = await setOverride(
    assessmentId,
    params.controlId,
    {
      status: body.status,
      owner: body.owner,
      lastReviewed: body.lastReviewed,
      narrative: body.narrative,
      assessorNotes: body.assessorNotes,
      poamId: body.poamId
    },
    updatedBy
  );
  return NextResponse.json({ override });
}
