import { NextResponse } from "next/server";
import { buildC3PAOPacket } from "@/lib/reports/c3pao-packet";
import { reportFileName } from "@/lib/reports/filename";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Bundling 3 XLSX files + JSON + README into a zip. Allow a generous timeout.
export const maxDuration = 30;

export async function GET() {
  const buf = await buildC3PAOPacket();
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${reportFileName("CMMC-L2_AssessmentPacket", "zip")}"`,
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store"
    }
  });
}
