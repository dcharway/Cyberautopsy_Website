/**
 * CUI Determination store — one record per assessment.
 *
 * Persisted at .data/cui/{assessmentId}.json. Reset by the assessment reset
 * endpoint. The category catalog + question set live in
 * data/cui-determination.ts and shouldn't drift out of code.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import {
  EMPTY_HEADER,
  EMPTY_SIGNATURES,
  type AnswerValue,
  type InfoAssetHeader,
  type SignatureBlock
} from "@/data/cui-determination";

export type CUIState = {
  assessmentId: string;
  assetHeader: InfoAssetHeader;
  answers: Record<string, AnswerValue>;
  rationaleNotes: Record<string, string>;
  selectedCategoryCodes: string[];      // e.g. ["CTI", "EXPT"]
  categoryOtherNote: string;            // free-text if the user needs a category outside the catalog
  signatures: SignatureBlock;
  updatedAt: string;
  updatedBy: string;
};

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const CUI_DIR = path.join(DATA_DIR, "cui");

const cache: Map<string, CUIState> = new Map();
let writableFs = true;
const writeLocks: Map<string, Promise<void>> = new Map();

function pathFor(assessmentId: string): string {
  return path.join(CUI_DIR, `${assessmentId}.json`);
}

function emptyState(assessmentId: string): CUIState {
  return {
    assessmentId,
    assetHeader: { ...EMPTY_HEADER },
    answers: {},
    rationaleNotes: {},
    selectedCategoryCodes: [],
    categoryOtherNote: "",
    signatures: { ...EMPTY_SIGNATURES },
    updatedAt: new Date(0).toISOString(),
    updatedBy: "system"
  };
}

export async function loadCUI(assessmentId: string): Promise<CUIState> {
  const cached = cache.get(assessmentId);
  if (cached) return cached;
  let state: CUIState;
  try {
    const raw = await fs.readFile(pathFor(assessmentId), "utf8");
    state = { ...emptyState(assessmentId), ...(JSON.parse(raw) as Partial<CUIState>) };
    if (!state.assetHeader) state.assetHeader = { ...EMPTY_HEADER };
    if (!state.answers) state.answers = {};
    if (!state.rationaleNotes) state.rationaleNotes = {};
    if (!state.selectedCategoryCodes) state.selectedCategoryCodes = [];
    if (state.categoryOtherNote === undefined) state.categoryOtherNote = "";
    if (!state.signatures) state.signatures = { ...EMPTY_SIGNATURES };
  } catch {
    state = emptyState(assessmentId);
  }
  cache.set(assessmentId, state);
  return state;
}

export async function patchCUIState(
  assessmentId: string,
  patch: {
    assetHeader?: Partial<InfoAssetHeader>;
    answers?: Record<string, AnswerValue>;
    rationaleNotes?: Record<string, string>;
    selectedCategoryCodes?: string[];
    categoryOtherNote?: string;
    signatures?: Partial<SignatureBlock>;
  },
  updatedBy: string
): Promise<CUIState> {
  const current = await loadCUI(assessmentId);
  const next: CUIState = {
    ...current,
    assetHeader: { ...current.assetHeader, ...(patch.assetHeader ?? {}) },
    answers: { ...current.answers, ...(patch.answers ?? {}) },
    rationaleNotes: { ...current.rationaleNotes, ...(patch.rationaleNotes ?? {}) },
    selectedCategoryCodes: patch.selectedCategoryCodes ?? current.selectedCategoryCodes,
    categoryOtherNote:
      patch.categoryOtherNote === undefined ? current.categoryOtherNote : patch.categoryOtherNote,
    signatures: { ...current.signatures, ...(patch.signatures ?? {}) },
    updatedAt: new Date().toISOString(),
    updatedBy
  };
  cache.set(assessmentId, next);
  await persist(assessmentId);
  return next;
}

/** Wipe CUI state for one assessment. Called by the reset endpoint. */
export async function clearCUI(assessmentId: string): Promise<void> {
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
      await fs.mkdir(CUI_DIR, { recursive: true });
      const tmp = `${pathFor(assessmentId)}.tmp-${process.pid}`;
      await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
      await fs.rename(tmp, pathFor(assessmentId));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        writableFs = false;
        console.warn(`[cui-store] Filesystem read-only (${code}). In-memory only.`);
      } else {
        throw err;
      }
    }
  });
  writeLocks.set(assessmentId, next);
  await next;
}
