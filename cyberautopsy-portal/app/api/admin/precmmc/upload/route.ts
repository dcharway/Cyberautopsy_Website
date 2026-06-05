import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadActive } from "@/lib/assessments";
import { saveUpload, computeReadiness, UploadValidationError, UPLOAD_RULES } from "@/lib/precmmc-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Reject obviously-too-large requests before reading the whole body. The
// store also re-validates against UPLOAD_RULES.maxBytes.
const HARD_BODY_CAP = UPLOAD_RULES.maxBytes + 1024 * 1024; // headroom for the multipart envelope

async function resolveAssessmentId(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("assessmentId");
  if (fromQuery) return fromQuery;
  return (await loadActive()).assessmentId;
}

export async function POST(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > HARD_BODY_CAP) {
    return NextResponse.json(
      { error: `Request body exceeds the ${UPLOAD_RULES.maxBytes / 1024 / 1024} MB upload limit.` },
      { status: 413 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid multipart body" },
      { status: 400 }
    );
  }

  const slot = String(form.get("slot") ?? "").trim();
  const file = form.get("file");
  if (!slot) {
    return NextResponse.json({ error: "Missing slot field" }, { status: 400 });
  }
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  const uploadedBy = req.headers.get("x-cyber-user") ?? "admin";
  const originalName = (file as File).name || "upload";
  const contentType = file.type || "application/octet-stream";
  const arrayBuf = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuf);

  try {
    const { state, upload } = await saveUpload(
      assessmentId,
      slot,
      { originalName, contentType, size: bytes.byteLength, bytes },
      uploadedBy
    );
    return NextResponse.json({ upload, state, readiness: computeReadiness(state) }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
