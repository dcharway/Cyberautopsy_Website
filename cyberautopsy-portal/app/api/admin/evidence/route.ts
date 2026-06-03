import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { listEvidence, createEvidence } from "@/lib/evidence-store";
import { loadActive } from "@/lib/assessments";

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
  const url = new URL(req.url);
  const controlId = url.searchParams.get("controlId") ?? undefined;
  const items = await listEvidence(assessmentId, { controlId });
  return NextResponse.json({ assessmentId, items });
}

export async function POST(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  const assessmentId = body.assessmentId ?? (await loadActive()).assessmentId;
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }
  const required = ["name", "type", "family", "fileName", "system", "owner", "collected"];
  for (const k of required) {
    if (typeof body[k] !== "string" || !body[k].trim()) {
      return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 });
    }
  }
  if (!Array.isArray(body.controlIds) || body.controlIds.length === 0) {
    return NextResponse.json({ error: "controlIds must be a non-empty array" }, { status: 400 });
  }
  const createdBy = req.headers.get("x-cyber-user") ?? "admin";
  const item = await createEvidence(
    assessmentId,
    {
      controlIds: body.controlIds,
      family: body.family,
      name: body.name,
      type: body.type,
      fileName: body.fileName,
      system: body.system,
      owner: body.owner,
      collected: body.collected,
      expires: body.expires || undefined,
      status: body.status ?? "Valid",
      location: body.location || undefined,
      notes: body.notes || undefined
    },
    createdBy
  );
  return NextResponse.json({ item }, { status: 201 });
}
