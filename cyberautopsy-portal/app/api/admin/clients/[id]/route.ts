import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { getClient, updateClient, archiveClient, unarchiveClient } from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

export async function GET(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const client = await getClient(params.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ client });
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  try {
    const client = await updateClient(params.id, body);
    return NextResponse.json({ client });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const url = new URL(req.url);
  const unarchive = url.searchParams.get("unarchive") === "1";
  try {
    if (unarchive) await unarchiveClient(params.id);
    else await archiveClient(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Archive failed";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}
