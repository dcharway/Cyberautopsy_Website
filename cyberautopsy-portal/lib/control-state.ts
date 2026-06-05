/**
 * Per-assessment control overrides + assessor notes.
 *
 * Seed CONTROLS[] is the 110-control baseline (read-only). When an admin
 * marks a control implemented, reassigns owner, updates the narrative, or
 * leaves an assessor note, the change is stored here keyed by assessmentId
 * and controlId. The merged view (seed + override) is what the UI and the
 * exports render.
 *
 * Persisted at .data/controls/{assessmentId}.json.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import type { Control, ControlStatus } from "./types";
import { CONTROLS as SEED_CONTROLS } from "@/data/controls110";

export type ControlOverride = {
  controlId: string;
  status?: ControlStatus;
  owner?: string;
  lastReviewed?: string;        // ISO date
  narrative?: string;
  assessorNotes?: string;
  poamId?: string | null;
  // CMMC acceptable-evidence catalog — which canonical artifacts the assessor
  // has confirmed they have seen / collected for this assessment. Strings are
  // the artifact labels from data/evidence-catalog.ts.
  acceptableEvidenceReviewed?: string[];
  updatedAt: string;
  updatedBy: string;
};

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const CTRL_DIR = path.join(DATA_DIR, "controls");

type Store = { overrides: Record<string, ControlOverride> };

const cache: Map<string, Store> = new Map();
let writableFs = true;
const writeLocks: Map<string, Promise<void>> = new Map();

function pathFor(assessmentId: string): string {
  return path.join(CTRL_DIR, `${assessmentId}.json`);
}

async function ensureLoaded(assessmentId: string): Promise<Store> {
  const existing = cache.get(assessmentId);
  if (existing) return existing;
  let store: Store;
  try {
    const raw = await fs.readFile(pathFor(assessmentId), "utf8");
    store = JSON.parse(raw) as Store;
  } catch {
    store = { overrides: {} };
  }
  cache.set(assessmentId, store);
  return store;
}

export async function loadOverrides(assessmentId: string): Promise<Map<string, ControlOverride>> {
  const store = await ensureLoaded(assessmentId);
  return new Map(Object.entries(store.overrides));
}

export async function getOverride(
  assessmentId: string,
  controlId: string
): Promise<ControlOverride | null> {
  const store = await ensureLoaded(assessmentId);
  return store.overrides[controlId] ?? null;
}

export async function setOverride(
  assessmentId: string,
  controlId: string,
  patch: Partial<Omit<ControlOverride, "controlId" | "updatedAt" | "updatedBy">>,
  updatedBy: string
): Promise<ControlOverride> {
  const store = await ensureLoaded(assessmentId);
  const existing = store.overrides[controlId];
  const next: ControlOverride = {
    ...existing,
    ...patch,
    controlId,
    updatedAt: new Date().toISOString(),
    updatedBy
  };
  store.overrides[controlId] = next;
  await persist(assessmentId);
  return next;
}

/** Merge seed CONTROLS with per-assessment overrides. */
export async function mergedControls(assessmentId: string | null): Promise<Control[]> {
  if (!assessmentId) return SEED_CONTROLS;
  const overrides = await loadOverrides(assessmentId);
  return SEED_CONTROLS.map((c) => {
    const o = overrides.get(c.id);
    if (!o) return c;
    return {
      ...c,
      status: o.status ?? c.status,
      owner: o.owner ?? c.owner,
      lastReviewed: o.lastReviewed ?? c.lastReviewed,
      narrative: o.narrative ?? c.narrative,
      poamId: o.poamId !== undefined ? o.poamId : c.poamId,
      acceptableEvidenceReviewed: o.acceptableEvidenceReviewed
    };
  });
}

/**
 * Wipe every override for one assessment. Used by the "Reset assessment"
 * admin action. The seed CONTROLS[] framework is never touched — only the
 * per-assessment override layer is deleted, so the 110-control structure
 * remains intact and the next read returns a fresh baseline.
 */
export async function clearAssessmentOverrides(assessmentId: string): Promise<void> {
  cache.set(assessmentId, { overrides: {} });
  if (!writableFs) return;
  try {
    await fs.unlink(pathFor(assessmentId));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      throw err;
    }
  }
}

async function persist(assessmentId: string): Promise<void> {
  if (!writableFs) return;
  const prev = writeLocks.get(assessmentId) ?? Promise.resolve();
  const next = prev.then(async () => {
    const store = cache.get(assessmentId);
    if (!store || !writableFs) return;
    try {
      await fs.mkdir(CTRL_DIR, { recursive: true });
      const tmp = `${pathFor(assessmentId)}.tmp-${process.pid}`;
      await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
      await fs.rename(tmp, pathFor(assessmentId));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        writableFs = false;
        console.warn(`[control-state] Filesystem read-only (${code}). In-memory only.`);
      } else {
        throw err;
      }
    }
  });
  writeLocks.set(assessmentId, next);
  await next;
}
