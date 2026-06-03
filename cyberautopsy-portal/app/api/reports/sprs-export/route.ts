import { NextResponse } from "next/server";
import { buildSPRSExport } from "@/lib/reports/sprs-export";
import { reportFileName } from "@/lib/reports/filename";
import { requireAdmin } from "@/lib/auth/require";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const data = buildSPRSExport();
  const body = JSON.stringify(data, null, 2);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${reportFileName("SPRS_Score", "json")}"`,
      "Content-Length": String(Buffer.byteLength(body)),
      "Cache-Control": "no-store"
    }
  });
}
