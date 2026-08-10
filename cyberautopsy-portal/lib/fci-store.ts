/**
 * FCI Determination store — one record per assessment.
 *
 * Persisted at .data/fci/{assessmentId}.json. Reset by the assessment reset
 * endpoint. Schema is intentionally shallow — the questions live in
 * data/fci-determination.ts and shouldn't drift out of code.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import {
  EMPTY_HEADER,
  EMPTY_SIGNATURES,
  type AnswerValue,
  type ContractHeader,
  type SignatureBlock
} from "@/data/fci-determination";

export type FCIState = {
  assessmentId: string;
  header: ContractHeader;
  answers: Record<string, AnswerValue>;
  rationaleNotes: Record<string, string>;    // per-question free-text
  signatures: SignatureBlock;
  updatedAt: string;
  updatedBy: string;
};

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const FCI_DIR = path.join(DATA_DIR, "fci");

const cache: Map<string, FCIState> = new Map();
let writableFs = true;
const writeLocks: Map<string, Promise<void>> = new Map();

function pathFor(assessmentId: string): string {
  return path.join(FCI_DIR, `${assessmentId}.json`);
}

function emptyState(assessmentId: string): FCIState {
  return {
    assessmentId,
    header: { ...EMPTY_HEADER },
    answers: {},
    rationaleNotes: {},
    signatures: { ...EMPTY_SIGNATURES },
    updatedAt: new Date(0).toISOString(),
    updatedBy: "system"
  };
}

export async function loadFCI(assessmentId: string): Promise<FCIState> {
  const cached = cache.get(assessmentId);
  if (cached) return cached;
  let state: FCIState;
  try {
    const raw = await fs.readFile(pathFor(assessmentId), "utf8");
    state = { ...emptyState(assessmentId), ...(JSON.parse(raw) as Partial<FCIState>) };
    // Backfill fields on old records so the shape stays consistent.
    if (!state.header) state.header = { ...EMPTY_HEADER };
    if (!state.answers) state.answers = {};
    if (!state.rationaleNotes) state.rationaleNotes = {};
    if (!state.signatures) state.signatures = { ...EMPTY_SIGNATURES };
  } catch {
    state = emptyState(assessmentId);
  }
  cache.set(assessmentId, state);
  return state;
}

export async function patchFCIState(
  assessmentId: string,
  patch: {
    header?: Partial<ContractHeader>;
    answers?: Record<string, AnswerValue>;
    rationaleNotes?: Record<string, string>;
    signatures?: Partial<SignatureBlock>;
  },
  updatedBy: string
): Promise<FCIState> {
  const current = await loadFCI(assessmentId);
  const next: FCIState = {
    ...current,
    header: { ...current.header, ...(patch.header ?? {}) },
    answers: { ...current.answers, ...(patch.answers ?? {}) },
    rationaleNotes: { ...current.rationaleNotes, ...(patch.rationaleNotes ?? {}) },
    signatures: { ...current.signatures, ...(patch.signatures ?? {}) },
    updatedAt: new Date().toISOString(),
    updatedBy
  };
  cache.set(assessmentId, next);
  await persist(assessmentId);
  return next;
}

/** Wipe FCI state for one assessment. Called by the reset endpoint. */
export async function clearFCI(assessmentId: string): Promise<void> {
  cache.set(assessmentId, emptyState(assessmentId));
  if (!writableFs) return;
  try {
    await fs.unlink(pathFor(assessmentId));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw err;
  }
}

async function persist(assessmentId: string): Promise<void> {
  if (!writableFs) return;
  const prev = writeLocks.get(assessmentId) ?? Promise.resolve();
  const next = prev.then(async () => {
    const state = cache.get(assessmentId);
    if (!state || !writableFs) return;
    try {
      await fs.mkdir(FCI_DIR, { recursive: true });
      const tmp = `${pathFor(assessmentId)}.tmp-${process.pid}`;
      await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
      await fs.rename(tmp, pathFor(assessmentId));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        writableFs = false;
        console.warn(`[fci-store] Filesystem read-only (${code}). In-memory only.`);
      } else {
        throw err;
      }
    }
  });
  writeLocks.set(assessmentId, next);
  await next;
}
