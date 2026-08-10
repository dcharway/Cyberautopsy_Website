import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadActive } from "@/lib/assessments";
import {
  addPOAMAttachment,
  POAM_UPLOAD_RULES,
  POAMUploadValidationError
} from "@/lib/poam-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HARD_BODY_CAP = POAM_UPLOAD_RULES.maxBytes + 1024 * 1024;

type RouteParams = { params: { id: string } };

async function resolveAssessmentId(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const q = url.searchParams.get("assessmentId");
  if (q) return q;
  return (await loadActive()).assessmentId;
}

export async function POST(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > HARD_BODY_CAP) {
    return NextResponse.json(
      { error: `Request body exceeds the ${POAM_UPLOAD_RULES.maxBytes / 1024 / 1024} MB upload limit.` },
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
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  const uploadedBy = req.headers.get("x-cyber-user") ?? "admin";
  const originalName = (file as File).name || "upload";
  const contentType = file.type || "application/octet-stream";
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const { item, attachment } = await addPOAMAttachment(
      assessmentId,
      params.id,
      { originalName, contentType, size: bytes.byteLength, bytes },
      uploadedBy
    );
    return NextResponse.json({ item, attachment }, { status: 201 });
  } catch (err) {
    if (err instanceof POAMUploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Upload failed";
    const status = msg.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
