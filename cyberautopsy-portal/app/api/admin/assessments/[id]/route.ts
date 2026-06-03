import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { getAssessment, updateAssessment, archiveAssessment } from "@/lib/assessments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

export async function GET(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessment = await getAssessment(params.id);
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ assessment });
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  const updatedBy = req.headers.get("x-cyber-user") ?? "admin";
  try {
    const assessment = await updateAssessment(params.id, body, updatedBy);
    return NextResponse.json({ assessment });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const archivedBy = req.headers.get("x-cyber-user") ?? "admin";
  try {
    await archiveAssessment(params.id, archivedBy);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Archive failed";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}
