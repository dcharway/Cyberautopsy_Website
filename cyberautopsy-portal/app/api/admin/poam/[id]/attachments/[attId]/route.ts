import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadActive } from "@/lib/assessments";
import { readPOAMAttachment, removePOAMAttachment } from "@/lib/poam-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string; attId: string } };

async function resolveAssessmentId(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const q = url.searchParams.get("assessmentId");
  if (q) return q;
  return (await loadActive()).assessmentId;
}

export async function GET(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  const result = await readPOAMAttachment(assessmentId, params.id, params.attId);
  if (!result) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });

  const url = new URL(req.url);
  const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
  return new NextResponse(new Uint8Array(result.bytes), {
    status: 200,
    headers: {
      "Content-Type": result.attachment.contentType,
      "Content-Disposition": `${disposition}; filename="${result.attachment.originalName.replace(/"/g, "")}"`,
      "Content-Length": String(result.bytes.byteLength),
      "Cache-Control": "private, no-store"
    }
  });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  const removedBy = req.headers.get("x-cyber-user") ?? "admin";
  try {
    const item = await removePOAMAttachment(assessmentId, params.id, params.attId, removedBy);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}
