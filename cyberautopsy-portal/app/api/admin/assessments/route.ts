import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadAssessments, createAssessment } from "@/lib/assessments";
import { getClient } from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId") ?? undefined;
  const assessments = await loadAssessments({ clientId });
  return NextResponse.json({ assessments });
}

export async function POST(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  if (typeof body.clientId !== "string" || !body.clientId.trim()) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }
  const client = await getClient(body.clientId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const createdBy = req.headers.get("x-cyber-user") ?? "admin";
  try {
    const assessment = await createAssessment(
      {
        clientId: body.clientId,
        reportingPeriod: body.reportingPeriod ?? "",
        engagementStart: body.engagementStart ?? new Date().toISOString().slice(0, 10),
        scheduledClose: body.scheduledClose ?? "",
        assessor: body.assessor ?? client.affirmingOfficial,
        documentVersion: body.documentVersion ?? "v1.0",
        classification: body.classification ?? "Controlled Unclassified Information (CUI)",
        affirmingOfficial: body.affirmingOfficial ?? client.affirmingOfficial,
        affirmingOfficialTitle: body.affirmingOfficialTitle ?? client.affirmingOfficialTitle,
        affirmingOfficialEmail: body.affirmingOfficialEmail ?? client.affirmingOfficialEmail,
        lastAffirmation: body.lastAffirmation ?? null,
        nextAffirmationDue: body.nextAffirmationDue ?? "",
        notes: body.notes
      },
      createdBy
    );
    return NextResponse.json({ assessment }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
