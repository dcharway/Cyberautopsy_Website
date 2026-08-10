/**
 * Scoping model store — one record per assessment.
 *
 * Persisted at .data/scoping/{assessmentId}.json. Reset by the assessment
 * reset endpoint.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomBytes } from "crypto";
import {
  EMPTY_SIGNATURES,
  type ScopeItem,
  type ScopeKind,
  type SignatureBlock
} from "@/data/scoping-model";

export type ScopingState = {
  assessmentId: string;
  items: ScopeItem[];
  notes: string;
  signatures: SignatureBlock;
  updatedAt: string;
  updatedBy: string;
};

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const SCOPING_DIR = path.join(DATA_DIR, "scoping");

const cache: Map<string, ScopingState> = new Map();
let writableFs = true;
const writeLocks: Map<string, Promise<void>> = new Map();

function pathFor(assessmentId: string): string {
  return path.join(SCOPING_DIR, `${assessmentId}.json`);
}

function emptyState(assessmentId: string): ScopingState {
  return {
    assessmentId,
    items: [],
    notes: "",
    signatures: { ...EMPTY_SIGNATURES },
    updatedAt: new Date(0).toISOString(),
    updatedBy: "system"
  };
}

export async function loadScoping(assessmentId: string): Promise<ScopingState> {
  const cached = cache.get(assessmentId);
  if (cached) return cached;
  let state: ScopingState;
  try {
    const raw = await fs.readFile(pathFor(assessmentId), "utf8");
    state = { ...emptyState(assessmentId), ...(JSON.parse(raw) as Partial<ScopingState>) };
    if (!Array.isArray(state.items)) state.items = [];
    if (!state.signatures) state.signatures = { ...EMPTY_SIGNATURES };
    if (state.notes === undefined) state.notes = "";
  } catch {
    state = emptyState(assessmentId);
  }
  cache.set(assessmentId, state);
  return state;
}

export async function addScopeItem(
  assessmentId: string,
  input: Omit<ScopeItem, "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy">,
  actor: string
): Promise<ScopingState> {
  const state = await loadScoping(assessmentId);
  const now = new Date().toISOString();
  const item: ScopeItem = {
    ...input,
    id: `scp_${randomBytes(6).toString("hex")}`,
    createdAt: now,
    createdBy: actor,
    updatedAt: now,
    updatedBy: actor
  };
  const next: ScopingState = {
    ...state,
    items: [...state.items, item],
    updatedAt: now,
    updatedBy: actor
  };
  cache.set(assessmentId, next);
  await persist(assessmentId);
  return next;
}

export async function updateScopeItem(
  assessmentId: string,
  itemId: string,
  patch: Partial<ScopeItem>,
  actor: string
): Promise<ScopingState> {
  const state = await loadScoping(assessmentId);
  const existing = state.items.find((i) => i.id === itemId);
  if (!existing) throw new Error(`Scope item ${itemId} not found`);
  const now = new Date().toISOString();
  const merged: ScopeItem = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    createdBy: existing.createdBy,
    updatedAt: now,
    updatedBy: actor
  };
  const next: ScopingState = {
    ...state,
    items: state.items.map((i) => (i.id === itemId ? merged : i)),
    updatedAt: now,
    updatedBy: actor
  };
  cache.set(assessmentId, next);
  await persist(assessmentId);
  return next;
}

export async function removeScopeItem(
  assessmentId: string,
  itemId: string,
  actor: string
): Promise<ScopingState> {
  const state = await loadScoping(assessmentId);
  const now = new Date().toISOString();
  const next: ScopingState = {
    ...state,
    items: state.items.filter((i) => i.id !== itemId),
    updatedAt: now,
    updatedBy: actor
  };
  cache.set(assessmentId, next);
  await persist(assessmentId);
  return next;
}

export async function patchScopingMeta(
  assessmentId: string,
  patch: { notes?: string; signatures?: Partial<SignatureBlock> },
  actor: string
): Promise<ScopingState> {
  const state = await loadScoping(assessmentId);
  const now = new Date().toISOString();
  const next: ScopingState = {
    ...state,
    notes: patch.notes ?? state.notes,
    signatures: { ...state.signatures, ...(patch.signatures ?? {}) },
    updatedAt: now,
    updatedBy: actor
  };
  cache.set(assessmentId, next);
  await persist(assessmentId);
  return next;
}

/** Wipe scoping state for one assessment. Called by the reset endpoint. */
export async function clearScoping(assessmentId: string): Promise<void> {
  cache.set(assessmentId, emptyState(assessmentId));
  if (!writableFs) return;
  try {
    await fs.unlink(pathFor(assessmentId));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw err;
  }
}

/** Convenience: items filtered by kind. */
export function itemsOfKind(state: ScopingState, kind: ScopeKind): ScopeItem[] {
  return state.items.filter((i) => i.kind === kind);
}

async function persist(assessmentId: string): Promise<void> {
  if (!writableFs) return;
  const prev = writeLocks.get(assessmentId) ?? Promise.resolve();
  const next = prev.then(async () => {
    const state = cache.get(assessmentId);
    if (!state || !writableFs) return;
    try {
      await fs.mkdir(SCOPING_DIR, { recursive: true });
      const tmp = `${pathFor(assessmentId)}.tmp-${process.pid}`;
      await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
      await fs.rename(tmp, pathFor(assessmentId));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        writableFs = false;
        console.warn(`[scoping-store] Filesystem read-only (${code}). In-memory only.`);
      } else {
        throw err;
      }
    }
  });
  writeLocks.set(assessmentId, next);
  await next;
}
