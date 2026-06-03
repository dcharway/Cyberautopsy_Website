import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { getPOAM, updatePOAM, archivePOAM } from "@/lib/poam-store";
import { loadActive } from "@/lib/assessments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

async function resolveAssessmentId(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("assessmentId");
  if (fromQuery) return fromQuery;
  const active = await loadActive();
  return active.assessmentId;
}

export async function GET(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }
  const item = await getPOAM(assessmentId, params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const assessmentId = body.assessmentId ?? (await resolveAssessmentId(req));
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }
  const updatedBy = req.headers.get("x-cyber-user") ?? "admin";
  try {
    const item = await updatePOAM(assessmentId, params.id, body, updatedBy, body.note);
    return NextResponse.json({ item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }
  const archivedBy = req.headers.get("x-cyber-user") ?? "admin";
  const url = new URL(req.url);
  const reason = url.searchParams.get("reason") ?? undefined;
  try {
    await archivePOAM(assessmentId, params.id, archivedBy, reason);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Archive failed";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}
