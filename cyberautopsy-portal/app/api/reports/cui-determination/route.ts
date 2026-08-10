import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadActive } from "@/lib/assessments";
import { loadCUI } from "@/lib/cui-store";
import { loadEngagement } from "@/lib/engagement";
import { buildCUIDeterminationPDF } from "@/lib/reports/cui-determination-pdf";
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
  const [state, engagement] = await Promise.all([loadCUI(assessmentId), loadEngagement()]);
  const buf = await buildCUIDeterminationPDF(state, engagement);
  const filename = await reportFileNameLive("CUI-Determination", "pdf");
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
