import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadActive } from "@/lib/assessments";
import { readUpload, deleteUpload, computeReadiness, loadPreCMMC } from "@/lib/precmmc-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { fileId: string } };

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
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }
  const result = await readUpload(assessmentId, params.fileId);
  if (!result) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const url = new URL(req.url);
  const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
  return new NextResponse(new Uint8Array(result.bytes), {
    status: 200,
    headers: {
      "Content-Type": result.upload.contentType,
      "Content-Disposition": `${disposition}; filename="${result.upload.originalName.replace(/"/g, "")}"`,
      "Content-Length": String(result.bytes.byteLength),
      "Cache-Control": "private, no-store"
    }
  });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }
  const deletedBy = req.headers.get("x-cyber-user") ?? "admin";
  try {
    const state = await deleteUpload(assessmentId, params.fileId, deletedBy);
    return NextResponse.json({ ok: true, state, readiness: computeReadiness(state) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    // Re-read state so caller can refresh even if we returned an error
    const state = await loadPreCMMC(assessmentId);
    return NextResponse.json({ error: msg, state, readiness: computeReadiness(state) }, { status: 404 });
  }
}
