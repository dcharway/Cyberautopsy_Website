/**
 * Assessment store.
 *
 * One client → many assessments. Each assessment freezes its own engagement
 * metadata (reporting period, dates, assessor, document version,
 * classification, affirming-official snapshot) so a re-generated report from
 * an older assessment is reproducible even after the client's defaults move.
 *
 * Persisted to .data/assessments.json.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomBytes } from "crypto";
import { getClient } from "./clients";

export type AssessmentStatus = "Active" | "Closed" | "Archived";

export type Assessment = {
  id: string;
  clientId: string;
  reportingPeriod: string;        // "2026-Q2"
  engagementStart: string;        // ISO date
  scheduledClose: string;         // ISO date
  assessor: string;               // Lead surgeon (can differ from client default)
  documentVersion: string;
  classification: string;
  // Affirmation snapshot frozen on this assessment
  affirmingOfficial: string;
  affirmingOfficialTitle: string;
  affirmingOfficialEmail?: string;
  lastAffirmation: string | null;
  nextAffirmationDue: string;
  // Lifecycle
  status: AssessmentStatus;
  notes?: string;
  createdAt: string;
  createdBy: string;
  closedAt?: string;
  closedBy?: string;
};

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "assessments.json");
const ACTIVE_PATH = path.join(DATA_DIR, "active.json");

type Store = { assessments: Record<string, Assessment> };
type ActiveRef = { clientId: string | null; assessmentId: string | null };

let cache: Store | null = null;
let activeCache: ActiveRef | null = null;
let writableFs = true;
let writeLock: Promise<void> = Promise.resolve();

/** Seed assessment for the default client so the demo isn't empty. */
const DEFAULT_ASSESSMENT: Assessment = {
  id: "asmt_seed_q2_2026",
  clientId: "cli_seed_northwind",
  reportingPeriod: "2026-Q2",
  engagementStart: "2026-03-15",
  scheduledClose: "2026-08-30",
  assessor: "M. Okafor",
  documentVersion: "v1.0",
  classification: "Controlled Unclassified Information (CUI)",
  affirmingOfficial: "C. Northwind",
  affirmingOfficialTitle: "Chief Executive Officer",
  lastAffirmation: "2025-08-12",
  nextAffirmationDue: "2026-08-12",
  status: "Active",
  createdAt: new Date(0).toISOString(),
  createdBy: "system"
};

export async function loadAssessments(filter?: { clientId?: string }): Promise<Assessment[]> {
  await ensureLoaded();
  const all = Object.values(cache!.assessments);
  const filtered = filter?.clientId ? all.filter((a) => a.clientId === filter.clientId) : all;
  // Active first, then by created descending
  return filtered.sort((a, b) => {
    if (a.status !== b.status) {
      const order = { Active: 0, Closed: 1, Archived: 2 } as const;
      return order[a.status] - order[b.status];
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function getAssessment(id: string): Promise<Assessment | null> {
  await ensureLoaded();
  return cache!.assessments[id] ?? null;
}

export async function createAssessment(
  data: Omit<
    Assessment,
    "id" | "createdAt" | "createdBy" | "status" | "closedAt" | "closedBy"
  > & { status?: AssessmentStatus },
  createdBy: string
): Promise<Assessment> {
  await ensureLoaded();
  const client = await getClient(data.clientId);
  if (!client) throw new Error(`Client ${data.clientId} not found`);
  const id = `asmt_${randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();
  const assessment: Assessment = {
    ...data,
    id,
    status: data.status ?? "Active",
    createdAt: now,
    createdBy
  };
  cache!.assessments[id] = assessment;
  await persist();
  return assessment;
}

export async function updateAssessment(
  id: string,
  updates: Partial<Assessment>,
  updatedBy: string
): Promise<Assessment> {
  await ensureLoaded();
  const existing = cache!.assessments[id];
  if (!existing) throw new Error(`Assessment ${id} not found`);
  const { id: _id, clientId: _cid, createdAt: _ca, createdBy: _cb, ...allowed } = updates;
  void _id; void _cid; void _ca; void _cb;
  // Auto-stamp closed metadata
  let closeStamp: Pick<Assessment, "closedAt" | "closedBy"> = {};
  if (allowed.status === "Closed" && existing.status !== "Closed") {
    closeStamp = { closedAt: new Date().toISOString(), closedBy: updatedBy };
  }
  const next = { ...existing, ...allowed, ...closeStamp };
  cache!.assessments[id] = next;
  await persist();
  return next;
}

export async function archiveAssessment(id: string, by: string): Promise<void> {
  await updateAssessment(id, { status: "Archived" }, by);
  // If the archived assessment was active, clear the pointer.
  const active = await loadActive();
  if (active.assessmentId === id) {
    await setActive({ ...active, assessmentId: null });
  }
}

/* ---------------- active client + assessment selector ---------------- */

export async function loadActive(): Promise<ActiveRef> {
  if (activeCache) return activeCache;
  try {
    const raw = await fs.readFile(ACTIVE_PATH, "utf8");
    activeCache = JSON.parse(raw) as ActiveRef;
  } catch {
    // Default to the seed if present
    activeCache = {
      clientId: "cli_seed_northwind",
      assessmentId: "asmt_seed_q2_2026"
    };
    await persistActive();
  }
  return activeCache;
}

export async function setActive(ref: Partial<ActiveRef>): Promise<ActiveRef> {
  const current = await loadActive();
  activeCache = {
    clientId: ref.clientId !== undefined ? ref.clientId : current.clientId,
    assessmentId: ref.assessmentId !== undefined ? ref.assessmentId : current.assessmentId
  };
  await persistActive();
  return activeCache;
}

export async function getActiveAssessment(): Promise<Assessment | null> {
  const ref = await loadActive();
  if (!ref.assessmentId) return null;
  return getAssessment(ref.assessmentId);
}

/* ---------------- internal: persistence ---------------- */

async function ensureLoaded(): Promise<void> {
  if (cache) return;
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    cache = JSON.parse(raw) as Store;
  } catch {
    cache = { assessments: {} };
  }
  if (Object.keys(cache.assessments).length === 0) {
    cache.assessments[DEFAULT_ASSESSMENT.id] = DEFAULT_ASSESSMENT;
    await persist();
  }
}

async function persist(): Promise<void> {
  if (!writableFs) return;
  writeLock = writeLock.then(async () => {
    if (!cache || !writableFs) return;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const tmp = `${STORE_PATH}.tmp-${process.pid}`;
      await fs.writeFile(tmp, JSON.stringify(cache, null, 2), "utf8");
      await fs.rename(tmp, STORE_PATH);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        writableFs = false;
        console.warn(`[assessments] Filesystem read-only (${code}). In-memory only.`);
      } else {
        throw err;
      }
    }
  });
  await writeLock;
}

async function persistActive(): Promise<void> {
  if (!writableFs || !activeCache) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${ACTIVE_PATH}.tmp-${process.pid}`;
    await fs.writeFile(tmp, JSON.stringify(activeCache, null, 2), "utf8");
    await fs.rename(tmp, ACTIVE_PATH);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      writableFs = false;
    } else {
      throw err;
    }
  }
}
