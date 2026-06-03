import { NextResponse } from "next/server";
import { buildC3PAOPacket } from "@/lib/reports/c3pao-packet";
import { reportFileNameLive } from "@/lib/reports/filename";
import { requireAdmin } from "@/lib/auth/require";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Bundling 5 XLSX files + JSON + README into a zip. Allow a generous timeout.
export const maxDuration = 60;

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const buf = await buildC3PAOPacket();
  const filename = await reportFileNameLive("CMMC-L2-AssessmentPacket", "zip");
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store"
    }
  });
}
