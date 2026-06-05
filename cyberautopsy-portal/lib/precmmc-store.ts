/**
 * Pre-CMMC Assessment Checklist store — per-assessment state + uploaded
 * artifact bytes.
 *
 * Layout on disk:
 *   .data/precmmc/{assessmentId}/state.json          — header, item answers, file index
 *   .data/precmmc/{assessmentId}/uploads/{fileId}    — raw file bytes
 *
 * The state file holds answers + metadata; the uploads directory holds the
 * actual artifacts. fileId is a random hex prefix joined with the sanitised
 * original filename so an `ls` on the disk is human-debuggable.
 *
 * Reset semantics: clearPreCMMC() wipes both state.json and the uploads
 * directory for that assessment, leaving the checklist schema (static) and
 * the assessment record (separate store) untouched.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomBytes } from "crypto";
import { PRECMMC_SECTIONS, UPLOAD_RULES, type ChecklistSection } from "@/data/precmmc-checklist";

export type ItemStatus = string | null;

export type UploadedFile = {
  id: string;
  slot: string;              // checklist item id, diagram slot id, or "notes"
  originalName: string;
  storedName: string;        // disk filename = `${id}__${safeName}`
  contentType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
};

export type ItemState = {
  status: ItemStatus;
  evidenceLocation?: string; // section 3 only
  notes?: string;
  uploadIds: string[];
};

export type PreCMMCState = {
  assessmentId: string;
  header: {
    client: string;
    date: string;
    inScopeSystems: string;
    assessor: string;
  };
  items: Record<string, ItemState>;
  files: Record<string, UploadedFile>;
  freeNotes: string;
  updatedAt: string;
  updatedBy: string;
};

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const PRECMMC_DIR = path.join(DATA_DIR, "precmmc");

const cache: Map<string, PreCMMCState> = new Map();
const writeLocks: Map<string, Promise<void>> = new Map();
let writableFs = true;

function stateDir(assessmentId: string): string {
  return path.join(PRECMMC_DIR, assessmentId);
}
function statePath(assessmentId: string): string {
  return path.join(stateDir(assessmentId), "state.json");
}
function uploadsDir(assessmentId: string): string {
  return path.join(stateDir(assessmentId), "uploads");
}

function emptyState(assessmentId: string): PreCMMCState {
  return {
    assessmentId,
    header: { client: "", date: "", inScopeSystems: "", assessor: "" },
    items: {},
    files: {},
    freeNotes: "",
    updatedAt: new Date(0).toISOString(),
    updatedBy: "system"
  };
}

export async function loadPreCMMC(assessmentId: string): Promise<PreCMMCState> {
  const cached = cache.get(assessmentId);
  if (cached) return cached;
  let state: PreCMMCState;
  try {
    const raw = await fs.readFile(statePath(assessmentId), "utf8");
    state = { ...emptyState(assessmentId), ...(JSON.parse(raw) as Partial<PreCMMCState>) };
  } catch {
    state = emptyState(assessmentId);
  }
  cache.set(assessmentId, state);
  return state;
}

export async function patchPreCMMCState(
  assessmentId: string,
  patch: {
    header?: Partial<PreCMMCState["header"]>;
    items?: Record<string, Partial<ItemState>>;
    freeNotes?: string;
  },
  updatedBy: string
): Promise<PreCMMCState> {
  const current = await loadPreCMMC(assessmentId);

  const nextItems: Record<string, ItemState> = { ...current.items };
  if (patch.items) {
    for (const [id, partial] of Object.entries(patch.items)) {
      const existing: ItemState = nextItems[id] ?? { status: null, uploadIds: [] };
      nextItems[id] = {
        ...existing,
        ...partial,
        uploadIds: partial.uploadIds ?? existing.uploadIds
      };
    }
  }

  const next: PreCMMCState = {
    ...current,
    header: { ...current.header, ...(patch.header ?? {}) },
    items: nextItems,
    freeNotes: patch.freeNotes ?? current.freeNotes,
    updatedAt: new Date().toISOString(),
    updatedBy
  };
  cache.set(assessmentId, next);
  await persistState(assessmentId);
  return next;
}

/* ---------- file upload ---------- */

export class UploadValidationError extends Error {
  status = 400;
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "upload";
}

function extOf(name: string): string {
  const ix = name.lastIndexOf(".");
  return ix === -1 ? "" : name.slice(ix + 1).toLowerCase();
}

export async function saveUpload(
  assessmentId: string,
  slot: string,
  file: {
    originalName: string;
    contentType: string;
    size: number;
    bytes: Buffer;
  },
  uploadedBy: string
): Promise<{ state: PreCMMCState; upload: UploadedFile }> {
  // Validate
  const ext = extOf(file.originalName);
  if (!UPLOAD_RULES.acceptedExtensions.includes(ext as (typeof UPLOAD_RULES.acceptedExtensions)[number])) {
    throw new UploadValidationError(
      `Unsupported file type ".${ext}". Allowed: ${UPLOAD_RULES.acceptedExtensions.join(", ")}.`
    );
  }
  if (file.size > UPLOAD_RULES.maxBytes) {
    throw new UploadValidationError(
      `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — limit is ${UPLOAD_RULES.maxBytes / 1024 / 1024} MB.`
    );
  }
  // Make sure the slot exists in the schema (item id or diagram id or "notes")
  const knownSlots = new Set<string>(["notes"]);
  for (const sec of PRECMMC_SECTIONS) for (const it of sec.items) knownSlots.add(it.id);
  // Diagram slots come from data — keep this import-light
  for (const id of ["network-architecture", "data-flow", "system-context"]) knownSlots.add(id);
  if (!knownSlots.has(slot)) {
    throw new UploadValidationError(`Unknown checklist slot "${slot}".`);
  }

  // Write the file to disk
  const current = await loadPreCMMC(assessmentId);
  const id = `f_${randomBytes(6).toString("hex")}`;
  const safe = sanitizeName(file.originalName);
  const storedName = `${id}__${safe}`;

  if (writableFs) {
    try {
      await fs.mkdir(uploadsDir(assessmentId), { recursive: true });
      await fs.writeFile(path.join(uploadsDir(assessmentId), storedName), file.bytes);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        writableFs = false;
        throw new Error(`Filesystem is read-only (${code}). Configure persistent storage to enable uploads.`);
      }
      throw err;
    }
  } else {
    throw new Error("Filesystem is read-only. Uploads are disabled in this deployment.");
  }

  const upload: UploadedFile = {
    id,
    slot,
    originalName: file.originalName,
    storedName,
    contentType: file.contentType || "application/octet-stream",
    size: file.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy
  };

  const nextItems: Record<string, ItemState> = { ...current.items };
  const item: ItemState = nextItems[slot] ?? { status: null, uploadIds: [] };
  nextItems[slot] = { ...item, uploadIds: [...item.uploadIds, id] };

  const state: PreCMMCState = {
    ...current,
    items: nextItems,
    files: { ...current.files, [id]: upload },
    updatedAt: new Date().toISOString(),
    updatedBy: uploadedBy
  };
  cache.set(assessmentId, state);
  await persistState(assessmentId);
  return { state, upload };
}

export async function readUpload(
  assessmentId: string,
  fileId: string
): Promise<{ upload: UploadedFile; bytes: Buffer } | null> {
  const state = await loadPreCMMC(assessmentId);
  const upload = state.files[fileId];
  if (!upload) return null;
  try {
    const bytes = await fs.readFile(path.join(uploadsDir(assessmentId), upload.storedName));
    return { upload, bytes };
  } catch {
    return null;
  }
}

export async function deleteUpload(
  assessmentId: string,
  fileId: string,
  deletedBy: string
): Promise<PreCMMCState> {
  const current = await loadPreCMMC(assessmentId);
  const upload = current.files[fileId];
  if (!upload) throw new Error(`Upload ${fileId} not found.`);

  if (writableFs) {
    try {
      await fs.unlink(path.join(uploadsDir(assessmentId), upload.storedName));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw err;
    }
  }

  const files = { ...current.files };
  delete files[fileId];
  const items: Record<string, ItemState> = {};
  for (const [k, v] of Object.entries(current.items)) {
    items[k] = { ...v, uploadIds: v.uploadIds.filter((x) => x !== fileId) };
  }
  const next: PreCMMCState = {
    ...current,
    files,
    items,
    updatedAt: new Date().toISOString(),
    updatedBy: deletedBy
  };
  cache.set(assessmentId, next);
  await persistState(assessmentId);
  return next;
}

/** Wipe checklist + uploaded files for one assessment. Used by reset. */
export async function clearPreCMMC(assessmentId: string): Promise<void> {
  cache.set(assessmentId, emptyState(assessmentId));
  if (!writableFs) return;
  // Remove uploads directory and state file
  try {
    await fs.rm(stateDir(assessmentId), { recursive: true, force: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw err;
  }
}

/* ---------- derived metrics ---------- */

export type Readiness = {
  totalItems: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  unanswered: number;
  readinessPct: number;
  filesUploaded: number;
  requiredDiagramsMissing: ("network-architecture" | "data-flow")[];
  goNoGoBlocking: boolean;            // any "no" in section 6
  partialInTechnical: boolean;        // any "partial" in section 3
  goLiveReady: boolean;               // all section 6 = yes AND no other red alerts
};

const COMPLETED_VALUES = new Set(["yes", "implemented"]);
const IN_PROGRESS_VALUES = new Set(["in-progress", "partial"]);
const NEGATIVE_VALUES = new Set(["no", "not-implemented"]);

export function computeReadiness(state: PreCMMCState): Readiness {
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  let unanswered = 0;
  let totalItems = 0;

  let goNoGoBlocking = false;
  let partialInTechnical = false;
  let goSectionAllYes = true;

  for (const section of PRECMMC_SECTIONS) {
    for (const item of section.items) {
      totalItems += 1;
      const status = state.items[item.id]?.status ?? null;
      if (status === null) {
        unanswered += 1;
      } else if (COMPLETED_VALUES.has(status)) {
        completed += 1;
      } else if (IN_PROGRESS_VALUES.has(status)) {
        inProgress += 1;
        if (section.id === "technical-control-evidence") partialInTechnical = true;
      } else if (NEGATIVE_VALUES.has(status)) {
        notStarted += 1;
      }
      if (section.blockingForGoLive) {
        if (status !== "yes") goSectionAllYes = false;
        if (status === "no") goNoGoBlocking = true;
      }
    }
  }

  const requiredDiagramsMissing: Readiness["requiredDiagramsMissing"] = [];
  for (const id of ["network-architecture", "data-flow"] as const) {
    const ids = state.items[id]?.uploadIds ?? [];
    if (ids.length === 0) requiredDiagramsMissing.push(id);
  }

  const filesUploaded = Object.keys(state.files).length;
  const readinessPct =
    totalItems === 0 ? 0 : Math.round((completed / totalItems) * 100);

  const goLiveReady =
    goSectionAllYes &&
    requiredDiagramsMissing.length === 0 &&
    !goNoGoBlocking;

  return {
    totalItems,
    completed,
    inProgress,
    notStarted,
    unanswered,
    readinessPct,
    filesUploaded,
    requiredDiagramsMissing,
    goNoGoBlocking,
    partialInTechnical,
    goLiveReady
  };
}

/* ---------- internal: persistence ---------- */

async function persistState(assessmentId: string): Promise<void> {
  if (!writableFs) return;
  const prev = writeLocks.get(assessmentId) ?? Promise.resolve();
  const next = prev.then(async () => {
    const state = cache.get(assessmentId);
    if (!state || !writableFs) return;
    try {
      await fs.mkdir(stateDir(assessmentId), { recursive: true });
      const tmp = `${statePath(assessmentId)}.tmp-${process.pid}`;
      await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
      await fs.rename(tmp, statePath(assessmentId));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        writableFs = false;
        console.warn(`[precmmc-store] Filesystem read-only (${code}). In-memory only.`);
      } else {
        throw err;
      }
    }
  });
  writeLocks.set(assessmentId, next);
  await next;
}

/* ---------- helpers re-exported for the UI server component ---------- */

export { PRECMMC_SECTIONS, UPLOAD_RULES };
export type { ChecklistSection };
