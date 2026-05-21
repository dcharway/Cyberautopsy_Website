import { NextResponse } from "next/server";
import { buildPOAMWorkbook } from "@/lib/reports/poam-workbook";
import { reportFileName } from "@/lib/reports/filename";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const buf = await buildPOAMWorkbook();
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${reportFileName("POAM_Workbook", "xlsx")}"`,
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store"
    }
  });
}
