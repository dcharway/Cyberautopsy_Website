import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadClients, createClient } from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  return NextResponse.json({ clients: await loadClients() });
}

export async function POST(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const required = ["organization", "organizationLegal", "cage", "systemBoundary"];
  for (const k of required) {
    if (typeof body[k] !== "string" || !body[k].trim()) {
      return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 });
    }
  }
  const createdBy = req.headers.get("x-cyber-user") ?? "admin";
  const client = await createClient(
    {
      organization: body.organization,
      organizationLegal: body.organizationLegal,
      cage: body.cage,
      duns: body.duns || undefined,
      systemBoundary: body.systemBoundary,
      contractValueUSD: typeof body.contractValueUSD === "number" ? body.contractValueUSD : undefined,
      primaryContact: body.primaryContact ?? undefined,
      rpoFirm: body.rpoFirm ?? "CyberAutopsy LLC",
      c3paoFirm: body.c3paoFirm ?? "",
      affirmingOfficial: body.affirmingOfficial ?? "",
      affirmingOfficialTitle: body.affirmingOfficialTitle ?? "",
      affirmingOfficialEmail: body.affirmingOfficialEmail || undefined
    },
    createdBy
  );
  return NextResponse.json({ client }, { status: 201 });
}
