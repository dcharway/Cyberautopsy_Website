/**
 * Evidence store — one file per assessment.
 *
 * Metadata-only persistence: each artifact carries control linkage, type,
 * collection date, expiration, owner, and a location/URL string the user
 * provides. Actual file blobs live in the user's evidence repository (NAS,
 * SharePoint, S3); the portal tracks the index.
 *
 * Persisted at .data/evidence/{assessmentId}.json.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomBytes } from "crypto";
import type { Evidence } from "./types";

export type EvidenceItem = Evidence & {
  assessmentId: string;
  location?: string;             // URL or path the user maintains
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  archivedAt?: string;
};

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const EVID_DIR = path.join(DATA_DIR, "evidence");

type Store = { items: Record<string, EvidenceItem> };

const cache: Map<string, Store> = new Map();
let writableFs = true;
const writeLocks: Map<string, Promise<void>> = new Map();

function pathFor(assessmentId: string): string {
  return path.join(EVID_DIR, `${assessmentId}.json`);
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
  }
  cache.set(assessmentId, store);
  return store;
}

export async function listEvidence(
  assessmentId: string,
  filter?: { controlId?: string; includeArchived?: boolean }
): Promise<EvidenceItem[]> {
  const store = await ensureLoaded(assessmentId);
  let items = Object.values(store.items);
  if (!filter?.includeArchived) items = items.filter((i) => !i.archivedAt);
  if (filter?.controlId) {
    items = items.filter((i) => i.controlIds.includes(filter.controlId!));
  }
  return items.sort((a, b) => b.collected.localeCompare(a.collected));
}

export async function getEvidence(assessmentId: string, id: string): Promise<EvidenceItem | null> {
  const store = await ensureLoaded(assessmentId);
  return store.items[id] ?? null;
}

export async function createEvidence(
  assessmentId: string,
  data: Omit<EvidenceItem, "id" | "assessmentId" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "archivedAt">,
  createdBy: string
): Promise<EvidenceItem> {
  const store = await ensureLoaded(assessmentId);
  const familyTag = data.family;
  const id = `EVD-${familyTag}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const now = new Date().toISOString();
  const item: EvidenceItem = {
    ...data,
    id,
    assessmentId,
    createdAt: now,
    createdBy
  };
  store.items[id] = item;
  await persist(assessmentId);
  return item;
}

export async function updateEvidence(
  assessmentId: string,
  id: string,
  updates: Partial<EvidenceItem>,
  updatedBy: string
): Promise<EvidenceItem> {
  const store = await ensureLoaded(assessmentId);
  const existing = store.items[id];
  if (!existing) throw new Error(`Evidence ${id} not found`);
  const { id: _id, assessmentId: _aid, createdAt: _ca, createdBy: _cb, ...allowed } = updates;
  void _id; void _aid; void _ca; void _cb;
  const next: EvidenceItem = {
    ...existing,
    ...allowed,
    updatedAt: new Date().toISOString(),
    updatedBy
  };
  store.items[id] = next;
  await persist(assessmentId);
  return next;
}

export async function archiveEvidence(assessmentId: string, id: string): Promise<void> {
  const store = await ensureLoaded(assessmentId);
  const existing = store.items[id];
  if (!existing) throw new Error(`Evidence ${id} not found`);
  store.items[id] = { ...existing, archivedAt: new Date().toISOString() };
  await persist(assessmentId);
}

async function persist(assessmentId: string): Promise<void> {
  if (!writableFs) return;
  const prev = writeLocks.get(assessmentId) ?? Promise.resolve();
  const next = prev.then(async () => {
    const store = cache.get(assessmentId);
    if (!store || !writableFs) return;
    try {
      await fs.mkdir(EVID_DIR, { recursive: true });
      const tmp = `${pathFor(assessmentId)}.tmp-${process.pid}`;
      await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
      await fs.rename(tmp, pathFor(assessmentId));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        writableFs = false;
        console.warn(`[evidence-store] Filesystem read-only (${code}). In-memory only.`);
      } else {
        throw err;
      }
    }
  });
  writeLocks.set(assessmentId, next);
  await next;
}
