import { NextResponse } from "next/server";
import { buildEvidenceMatrix } from "@/lib/reports/evidence-matrix";
import { reportFileName } from "@/lib/reports/filename";
import { requireAdmin } from "@/lib/auth/require";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const buf = await buildEvidenceMatrix();
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${reportFileName("Evidence_Mapping_Matrix", "xlsx")}"`,
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store"
    }
  });
}
