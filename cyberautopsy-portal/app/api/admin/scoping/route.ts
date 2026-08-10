import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import { loadActive } from "@/lib/assessments";
import {
  loadScoping,
  addScopeItem,
  updateScopeItem,
  removeScopeItem,
  patchScopingMeta
} from "@/lib/scoping-store";
import { summarize, type ScopeItem } from "@/data/scoping-model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveAssessmentId(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const q = url.searchParams.get("assessmentId");
  if (q) return q;
  return (await loadActive()).assessmentId;
}

export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  const state = await loadScoping(assessmentId);
  return NextResponse.json({ state, summary: summarize(state.items) });
}

/**
 * Unified PATCH endpoint that supports:
 *   - { action: "add",    item: {...} }
 *   - { action: "update", itemId, patch: {...} }
 *   - { action: "remove", itemId }
 *   - { action: "meta",   notes?, signatures? }
 *
 * Keeping it single-endpoint keeps the client's fetch surface small.
 */
export async function PATCH(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const assessmentId = await resolveAssessmentId(req);
  if (!assessmentId) return NextResponse.json({ error: "No active assessment" }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.action !== "string") {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }
  const actor = req.headers.get("x-cyber-user") ?? "admin";
  try {
    let state;
    if (body.action === "add") {
      if (!body.item?.kind || !body.item?.name) {
        return NextResponse.json({ error: "item.kind and item.name are required" }, { status: 400 });
      }
      state = await addScopeItem(assessmentId, body.item as Omit<ScopeItem, "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy">, actor);
    } else if (body.action === "update") {
      if (!body.itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });
      state = await updateScopeItem(assessmentId, body.itemId, body.patch ?? {}, actor);
    } else if (body.action === "remove") {
      if (!body.itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });
      state = await removeScopeItem(assessmentId, body.itemId, actor);
    } else if (body.action === "meta") {
      state = await patchScopingMeta(
        assessmentId,
        { notes: body.notes, signatures: body.signatures },
        actor
      );
    } else {
      return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
    }
    return NextResponse.json({ state, summary: summarize(state.items) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Operation failed";
    const status = msg.toLowerCase().includes("not found") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
