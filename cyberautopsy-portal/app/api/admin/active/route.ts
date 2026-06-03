import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadActive, setActive, getAssessment } from "@/lib/assessments";
import { getClient } from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const ref = await loadActive();
  const [client, assessment] = await Promise.all([
    ref.clientId ? getClient(ref.clientId) : Promise.resolve(null),
    ref.assessmentId ? getAssessment(ref.assessmentId) : Promise.resolve(null)
  ]);
  return NextResponse.json({ ref, client, assessment });
}

export async function POST(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  // Validate references before persisting
  if (body.clientId) {
    const c = await getClient(body.clientId);
    if (!c) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  if (body.assessmentId) {
    const a = await getAssessment(body.assessmentId);
    if (!a) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    // If the client wasn't passed but the assessment was, lock the active client to the assessment's owner.
    if (!body.clientId) body.clientId = a.clientId;
    if (body.clientId && a.clientId !== body.clientId) {
      return NextResponse.json(
        { error: "Assessment does not belong to the specified client" },
        { status: 400 }
      );
    }
  }

  const ref = await setActive({
    clientId: body.clientId ?? undefined,
    assessmentId: body.assessmentId ?? undefined
  });
  return NextResponse.json({ ref });
}
