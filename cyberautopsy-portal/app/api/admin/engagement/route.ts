import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadEngagement, saveEngagement } from "@/lib/engagement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const data = await loadEngagement();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  let updates: Record<string, unknown>;
  try {
    updates = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const updatedBy = req.headers.get("x-cyber-user") ?? "admin";
  const data = await saveEngagement(updates, updatedBy);
  return NextResponse.json({ ok: true, engagement: data });
}
