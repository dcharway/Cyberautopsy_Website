import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadActive } from "@/lib/assessments";
import { loadScoping } from "@/lib/scoping-store";
import { loadEngagement } from "@/lib/engagement";
import { buildScopingModelPDF } from "@/lib/reports/scoping-model-pdf";
import { reportFileNameLive } from "@/lib/reports/filename";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const url = new URL(req.url);
  const assessmentId =
    url.searchParams.get("assessmentId") ?? (await loadActive()).assessmentId;
  if (!assessmentId) {
    return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  }
  const [state, engagement] = await Promise.all([loadScoping(assessmentId), loadEngagement()]);
  const buf = await buildScopingModelPDF(state, engagement);
  const filename = await reportFileNameLive("Scoping-Model", "pdf");
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store"
    }
  });
}
