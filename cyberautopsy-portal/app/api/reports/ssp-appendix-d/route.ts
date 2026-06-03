import { NextResponse } from "next/server";
import { buildSSPAppendixD } from "@/lib/reports/ssp-appendix-d";
import { reportFileName } from "@/lib/reports/filename";
import { requireAdmin } from "@/lib/auth/require";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const buf = await buildSSPAppendixD();
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${reportFileName("SSP_AppendixD", "xlsx")}"`,
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store"
    }
  });
}
