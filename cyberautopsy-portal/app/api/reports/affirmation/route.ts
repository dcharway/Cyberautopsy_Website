import { NextResponse } from "next/server";
import { buildAffirmationStatement } from "@/lib/reports/affirmation";
import { reportFileNameLive } from "@/lib/reports/filename";
import { requireAdmin } from "@/lib/auth/require";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const buf = await buildAffirmationStatement();
  const filename = await reportFileNameLive("Annual-Affirmation-Statement", "xlsx");
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
