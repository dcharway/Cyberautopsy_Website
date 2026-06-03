import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { listPOAMs, createPOAM } from "@/lib/poam-store";
import { loadActive, getAssessment } from "@/lib/assessments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveAssessmentId(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("assessmentId");
  if (fromQuery) return fromQuery;
  const active = await loadActive();
  return active.assessmentId;
}

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) {
    return NextResponse.json(
      { error: "No active assessment. Pass ?assessmentId= or set active first." },
      { status: 400 }
    );
  }
  const url = new URL(req.url);
  const includeArchived = url.searchParams.get("includeArchived") === "1";
  const items = await listPOAMs(assessmentId, includeArchived);
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
  const assessment = await getAssessment(assessmentId);
  if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

  const required = ["controlId", "weakness", "remediationPlan", "owner", "scheduledClose"];
  for (const k of required) {
    if (typeof body[k] !== "string" || !body[k].trim()) {
      return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 });
    }
  }
  const createdBy = req.headers.get("x-cyber-user") ?? "admin";
  const item = await createPOAM(
    assessmentId,
    {
      controlId: body.controlId,
      weakness: body.weakness,
      risk: (body.risk as "Low" | "Medium" | "High") ?? "Medium",
      remediationPlan: body.remediationPlan,
      scheduledClose: body.scheduledClose,
      status: (body.status as "Open" | "In Remediation" | "Pending Review" | "Closed") ?? "Open",
      owner: body.owner,
      opened: body.opened ?? new Date().toISOString().slice(0, 10),
      comments: body.comments,
      milestones: Array.isArray(body.milestones) ? body.milestones : []
    },
    createdBy
  );
  return NextResponse.json({ item }, { status: 201 });
}
