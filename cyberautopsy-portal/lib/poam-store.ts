/**
 * POA&M store — one file per assessment, full edit history per item.
 *
 * Each POAMItem carries a `history[]` of audit entries (who changed what, when)
 * so the assessor can show the C3PAO the full remediation trail. Deletes are
 * soft — items are archived, never hard-deleted, so the audit trail survives.
 *
 * Persisted at .data/poam/{assessmentId}.json.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomBytes } from "crypto";
import type { POAM } from "./types";
import { POAMS as SEED_POAMS } from "@/data/poam";

export type POAMStatus = POAM["status"];
export type POAMRisk = POAM["risk"];

export type Milestone = {
  id: string;
  description: string;
  due: string;       // ISO date
  done: boolean;
  completedAt?: string;
};

export type POAMHistoryEntry = {
  at: string;
  by: string;
  changes: Array<{ field: string; from: unknown; to: unknown }>;
  note?: string;
};

export type POAMAttachment = {
  id: string;                    // "att_..." random hex
  originalName: string;
  storedName: string;            // on-disk filename ({id}__{safeName})
  contentType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  kind: "image" | "document";    // driven by extension — used by the UI to render thumbnails vs file chips
};

export type POAMItem = {
  id: string;
  assessmentId: string;
  controlId: string;
  weakness: string;
  risk: POAMRisk;
  remediationPlan: string;
  milestones: Milestone[];
  scheduledClose: string;
  status: POAMStatus;
  owner: string;
  opened: string;
  closed?: string;
  comments?: string;
  attachments: POAMAttachment[];
  history: POAMHistoryEntry[];
  createdAt: string;
  createdBy: string;
  archivedAt?: string;
  archivedBy?: string;
};

/** Allowed upload rules — mirror the pre-CMMC uploader shape so validators
 *  stay in one place, but with images explicitly first-class. */
export const POAM_UPLOAD_RULES = {
  acceptedExtensions: [
    // Images
    "png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "tiff",
    // Documents
    "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
    "txt", "csv", "log", "json", "xml", "html",
    // Diagrams / archives
    "vsdx", "drawio", "zip"
  ],
  imageExtensions: new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "tiff"]),
  maxBytes: 25 * 1024 * 1024 // 25 MB — POA&M evidence tends to be screenshots and scan PDFs
} as const;

export class POAMUploadValidationError extends Error {
  status = 400;
}

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const POAM_DIR = path.join(DATA_DIR, "poam");
const POAM_UPLOADS_DIR = path.join(DATA_DIR, "poam-uploads");

type Store = { items: Record<string, POAMItem> };

const SEED_ASSESSMENT_ID = "asmt_seed_q2_2026";

// Cached per-assessment to avoid disk reads on every request.
const cache: Map<string, Store> = new Map();
let writableFs = true;
const writeLocks: Map<string, Promise<void>> = new Map();

function pathFor(assessmentId: string): string {
  return path.join(POAM_DIR, `${assessmentId}.json`);
}

async function ensureLoaded(assessmentId: string): Promise<Store> {
  const existing = cache.get(assessmentId);
  if (existing) return existing;
  let store: Store;
  try {
    const raw = await fs.readFile(pathFor(assessmentId), "utf8");
    store = JSON.parse(raw) as Store;
  } catch {
    store = { items: {} };
    // Seed the demo assessment with the canned POA&Ms so the page isn't empty.
    if (assessmentId === SEED_ASSESSMENT_ID) {
      for (const p of SEED_POAMS) {
        store.items[p.id] = {
          ...p,
          assessmentId,
          milestones: [],
          attachments: [],
          history: [
            {
              at: p.opened,
              by: "system",
              changes: [{ field: "status", from: null, to: p.status }],
              note: "Imported from CMMC readiness baseline"
            }
          ],
          createdAt: p.opened,
          createdBy: "system"
        };
      }
      cache.set(assessmentId, store);
      await persist(assessmentId);
      return store;
    }
  }
  // Backfill attachments[] on old records so the new field is always safe to read.
  let dirty = false;
  for (const it of Object.values(store.items)) {
    if (!Array.isArray(it.attachments)) {
      it.attachments = [];
      dirty = true;
    }
  }
  cache.set(assessmentId, store);
  if (dirty) await persist(assessmentId);
  return store;
}

export async function listPOAMs(assessmentId: string, includeArchived = false): Promise<POAMItem[]> {
  const store = await ensureLoaded(assessmentId);
  const items = Object.values(store.items).filter((i) => includeArchived || !i.archivedAt);
  return items.sort((a, b) => a.scheduledClose.localeCompare(b.scheduledClose));
}

export async function getPOAM(assessmentId: string, id: string): Promise<POAMItem | null> {
  const store = await ensureLoaded(assessmentId);
  return store.items[id] ?? null;
}

export async function createPOAM(
  assessmentId: string,
  data: Omit<
    POAMItem,
    | "id" | "assessmentId" | "history" | "milestones" | "attachments" | "createdAt" | "createdBy" | "archivedAt" | "archivedBy"
  > & { milestones?: Milestone[] },
  createdBy: string
): Promise<POAMItem> {
  const store = await ensureLoaded(assessmentId);
  const nextNum = nextPoamNumber(store);
  const id = `POAM-${String(nextNum).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const item: POAMItem = {
    ...data,
    id,
    assessmentId,
    milestones: data.milestones ?? [],
    attachments: [],
    history: [
      {
        at: now,
        by: createdBy,
        changes: [
          { field: "status", from: null, to: data.status },
          { field: "risk", from: null, to: data.risk },
          { field: "owner", from: null, to: data.owner },
          { field: "scheduledClose", from: null, to: data.scheduledClose }
        ],
        note: "POA&M opened"
      }
    ],
    createdAt: now,
    createdBy
  };
  store.items[id] = item;
  await persist(assessmentId);
  return item;
}

const TRACKED_FIELDS: Array<keyof POAMItem> = [
  "weakness",
  "risk",
  "remediationPlan",
  "scheduledClose",
  "status",
  "owner",
  "comments"
];

export async function updatePOAM(
  assessmentId: string,
  id: string,
  updates: Partial<POAMItem>,
  updatedBy: string,
  note?: string
): Promise<POAMItem> {
  const store = await ensureLoaded(assessmentId);
  const existing = store.items[id];
  if (!existing) throw new Error(`POA&M ${id} not found`);

  const changes: POAMHistoryEntry["changes"] = [];
  for (const k of TRACKED_FIELDS) {
    if (k in updates && updates[k] !== undefined && updates[k] !== existing[k]) {
      changes.push({ field: k, from: existing[k], to: updates[k] });
    }
  }
  // Milestone changes — treat as a single field; record before/after array
  if (updates.milestones && !milestonesEqual(updates.milestones, existing.milestones)) {
    changes.push({ field: "milestones", from: existing.milestones, to: updates.milestones });
  }

  const closeStamp: Pick<POAMItem, "closed"> = {};
  if (updates.status === "Closed" && existing.status !== "Closed") {
    closeStamp.closed = new Date().toISOString().slice(0, 10);
  }

  const next: POAMItem = {
    ...existing,
    ...updates,
    id: existing.id,
    assessmentId: existing.assessmentId,
    createdAt: existing.createdAt,
    createdBy: existing.createdBy,
    history: changes.length
      ? [...existing.history, { at: new Date().toISOString(), by: updatedBy, changes, note }]
      : existing.history,
    ...closeStamp
  };
  store.items[id] = next;
  await persist(assessmentId);
  return next;
}

/**
 * Wipe every POA&M for one assessment. Used by the "Reset assessment" admin
 * action. We persist an explicit empty file so the next `ensureLoaded` reads
 * valid JSON and does NOT re-seed the demo POA&M set — even on the seeded
 * demo assessment, a reset means a clean slate.
 *
 * Also nukes every uploaded attachment blob for the assessment so no orphan
 * bytes linger on disk after the reset.
 */
export async function clearPOAMs(assessmentId: string): Promise<void> {
  cache.set(assessmentId, { items: {} });
  await persist(assessmentId);
  if (writableFs) {
    try {
      await fs.rm(path.join(POAM_UPLOADS_DIR, assessmentId), { recursive: true, force: true });
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw err;
    }
  }
}

/* ---------- attachment helpers ---------- */

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "upload";
}
function extOf(name: string): string {
  const ix = name.lastIndexOf(".");
  return ix === -1 ? "" : name.slice(ix + 1).toLowerCase();
}
function attachmentDir(assessmentId: string, poamId: string): string {
  return path.join(POAM_UPLOADS_DIR, assessmentId, poamId);
}
function attachmentPath(assessmentId: string, poamId: string, storedName: string): string {
  return path.join(attachmentDir(assessmentId, poamId), storedName);
}

/**
 * Persist a new attachment for a POA&M, appending to attachments[] + adding a
 * history entry so the audit trail shows exactly when the file arrived.
 */
export async function addPOAMAttachment(
  assessmentId: string,
  poamId: string,
  file: { originalName: string; contentType: string; size: number; bytes: Buffer },
  uploadedBy: string
): Promise<{ item: POAMItem; attachment: POAMAttachment }> {
  const store = await ensureLoaded(assessmentId);
  const existing = store.items[poamId];
  if (!existing) throw new Error(`POA&M ${poamId} not found`);

  const ext = extOf(file.originalName);
  if (!POAM_UPLOAD_RULES.acceptedExtensions.includes(ext as (typeof POAM_UPLOAD_RULES.acceptedExtensions)[number])) {
    throw new POAMUploadValidationError(
      `Unsupported file type ".${ext}". Allowed: ${POAM_UPLOAD_RULES.acceptedExtensions.join(", ")}.`
    );
  }
  if (file.size > POAM_UPLOAD_RULES.maxBytes) {
    throw new POAMUploadValidationError(
      `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — limit is ${POAM_UPLOAD_RULES.maxBytes / 1024 / 1024} MB.`
    );
  }
  if (!writableFs) {
    throw new Error("Filesystem is read-only. POA&M uploads are disabled in this deployment.");
  }

  const id = `att_${randomBytes(6).toString("hex")}`;
  const safe = sanitizeName(file.originalName);
  const storedName = `${id}__${safe}`;

  try {
    await fs.mkdir(attachmentDir(assessmentId, poamId), { recursive: true });
    await fs.writeFile(attachmentPath(assessmentId, poamId, storedName), file.bytes);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      writableFs = false;
      throw new Error(`Filesystem read-only (${code}). Configure persistent storage to enable uploads.`);
    }
    throw err;
  }

  const attachment: POAMAttachment = {
    id,
    originalName: file.originalName,
    storedName,
    contentType: file.contentType || "application/octet-stream",
    size: file.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
    kind: POAM_UPLOAD_RULES.imageExtensions.has(ext) ? "image" : "document"
  };

  const now = new Date().toISOString();
  const next: POAMItem = {
    ...existing,
    attachments: [...existing.attachments, attachment],
    history: [
      ...existing.history,
      {
        at: now,
        by: uploadedBy,
        changes: [{ field: "attachment", from: null, to: attachment.originalName }],
        note: `Attached ${attachment.originalName} (${(attachment.size / 1024).toFixed(0)} KB)`
      }
    ]
  };
  store.items[poamId] = next;
  await persist(assessmentId);
  return { item: next, attachment };
}

/** Fetch attachment metadata + bytes for download. */
export async function readPOAMAttachment(
  assessmentId: string,
  poamId: string,
  attachmentId: string
): Promise<{ attachment: POAMAttachment; bytes: Buffer } | null> {
  const store = await ensureLoaded(assessmentId);
  const item = store.items[poamId];
  if (!item) return null;
  const att = item.attachments.find((a) => a.id === attachmentId);
  if (!att) return null;
  try {
    const bytes = await fs.readFile(attachmentPath(assessmentId, poamId, att.storedName));
    return { attachment: att, bytes };
  } catch {
    return null;
  }
}

/** Remove an attachment, delete its bytes from disk, and audit-log it. */
export async function removePOAMAttachment(
  assessmentId: string,
  poamId: string,
  attachmentId: string,
  removedBy: string
): Promise<POAMItem> {
  const store = await ensureLoaded(assessmentId);
  const existing = store.items[poamId];
  if (!existing) throw new Error(`POA&M ${poamId} not found`);
  const att = existing.attachments.find((a) => a.id === attachmentId);
  if (!att) throw new Error(`Attachment ${attachmentId} not found on ${poamId}`);

  if (writableFs) {
    try {
      await fs.unlink(attachmentPath(assessmentId, poamId, att.storedName));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw err;
    }
  }
  const now = new Date().toISOString();
  const next: POAMItem = {
    ...existing,
    attachments: existing.attachments.filter((a) => a.id !== attachmentId),
    history: [
      ...existing.history,
      {
        at: now,
        by: removedBy,
        changes: [{ field: "attachment", from: att.originalName, to: null }],
        note: `Removed ${att.originalName}`
      }
    ]
  };
  store.items[poamId] = next;
  await persist(assessmentId);
  return next;
}

export async function archivePOAM(
  assessmentId: string,
  id: string,
  archivedBy: string,
  reason?: string
): Promise<void> {
  const store = await ensureLoaded(assessmentId);
  const existing = store.items[id];
  if (!existing) throw new Error(`POA&M ${id} not found`);
  const now = new Date().toISOString();
  store.items[id] = {
    ...existing,
    archivedAt: now,
    archivedBy,
    history: [
      ...existing.history,
      {
        at: now,
        by: archivedBy,
        changes: [{ field: "archived", from: false, to: true }],
        note: reason ?? "POA&M archived"
      }
    ]
  };
  await persist(assessmentId);
}

/* ---------- internal helpers ---------- */

function nextPoamNumber(store: Store): number {
  let max = 0;
  for (const id of Object.keys(store.items)) {
    const m = id.match(/^POAM-(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

function milestonesEqual(a: Milestone[], b: Milestone[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((m, i) =>
    m.id === b[i].id &&
    m.description === b[i].description &&
    m.due === b[i].due &&
    m.done === b[i].done
  );
}

export function newMilestoneId(): string {
  return `ms_${randomBytes(4).toString("hex")}`;
}

async function persist(assessmentId: string): Promise<void> {
  if (!writableFs) return;
  const prev = writeLocks.get(assessmentId) ?? Promise.resolve();
  const next = prev.then(async () => {
    const store = cache.get(assessmentId);
    if (!store || !writableFs) return;
    try {
      await fs.mkdir(POAM_DIR, { recursive: true });
      const tmp = `${pathFor(assessmentId)}.tmp-${process.pid}`;
      await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
      await fs.rename(tmp, pathFor(assessmentId));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        writableFs = false;
        console.warn(`[poam-store] Filesystem read-only (${code}). In-memory only.`);
      } else {
        throw err;
      }
    }
  });
  writeLocks.set(assessmentId, next);
  await next;
}
