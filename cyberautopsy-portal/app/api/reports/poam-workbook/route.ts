import { NextResponse } from "next/server";
import { buildPOAMWorkbook } from "@/lib/reports/poam-workbook";
import { reportFileNameLive } from "@/lib/reports/filename";
import { requireAdmin } from "@/lib/auth/require";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const buf = await buildPOAMWorkbook();
  const filename = await reportFileNameLive("POAM-Workbook", "xlsx");
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store"
    }
  });
}
