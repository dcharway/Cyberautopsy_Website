/**
 * Engagement metadata — derived from the active client + active assessment.
 *
 * The active client + assessment selector (lib/assessments.ts → loadActive())
 * is the source of truth. This module's job is to project the active pair
 * onto the flat shape that the exporters and shell already consume.
 *
 * Backwards compat: if no active assessment exists (fresh deploy, all
 * archived), we fall back to a hard-coded DEFAULTS record. Editing
 * /admin/engagement now updates the active *assessment* — not a global
 * record — so the next export from that assessment reflects the change.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { getClient } from "./clients";
import { getActiveAssessment, loadActive, updateAssessment } from "./assessments";

export type Engagement = {
  // --- Client identity ---
  organization: string;
  organizationLegal: string;
  cage: string;
  ducns?: string;
  systemBoundary: string;
  contractValueUSD?: number;

  // --- Engagement parties ---
  assessor: string;
  rpoFirm: string;
  c3paoFirm: string;

  // --- Dates ---
  engagementStart: string;
  scheduledClose: string;
  reportingPeriod: string;

  // --- Document branding defaults ---
  documentVersion: string;
  classification: string;

  // --- Annual affirmation ---
  affirmingOfficial: string;
  affirmingOfficialTitle: string;
  affirmingOfficialEmail?: string;
  lastAffirmation: string | null;
  nextAffirmationDue: string;

  // --- Metadata about the record itself ---
  updatedAt: string;
  updatedBy: string;
};

const DEFAULTS: Engagement = {
  organization: "Northwind Defense Systems",
  organizationLegal: "Northwind Defense Systems, LLC",
  cage: "1A2B3",
  systemBoundary: "CUI Enclave — Primary",
  assessor: "M. Okafor",
  rpoFirm: "CyberAutopsy LLC",
  c3paoFirm: "Veritas Cyber Assessors",
  engagementStart: "2026-03-15",
  scheduledClose: "2026-08-30",
  reportingPeriod: "2026-Q2",
  documentVersion: "v1.0",
  classification: "Controlled Unclassified Information (CUI)",
  affirmingOfficial: "C. Northwind",
  affirmingOfficialTitle: "Chief Executive Officer",
  affirmingOfficialEmail: undefined,
  lastAffirmation: "2025-08-12",
  nextAffirmationDue: "2026-08-12",
  updatedAt: new Date(0).toISOString(),
  updatedBy: "system"
};

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const FALLBACK_PATH = path.join(DATA_DIR, "engagement.json");

let fallbackCache: Engagement | null = null;
let writableFs = true;
let writeLock: Promise<void> = Promise.resolve();

async function loadFallback(): Promise<Engagement> {
  if (fallbackCache) return fallbackCache;
  try {
    const raw = await fs.readFile(FALLBACK_PATH, "utf8");
    fallbackCache = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Engagement>) };
  } catch {
    fallbackCache = { ...DEFAULTS };
  }
  return fallbackCache;
}

/** Build the projected engagement from active client + assessment. */
export async function loadEngagement(): Promise<Engagement> {
  const active = await loadActive();
  if (!active.clientId || !active.assessmentId) return loadFallback();
  const [client, assessment] = await Promise.all([
    getClient(active.clientId),
    getActiveAssessment()
  ]);
  if (!client || !assessment) return loadFallback();
  return {
    organization: client.organization,
    organizationLegal: client.organizationLegal,
    cage: client.cage,
    ducns: client.duns,
    systemBoundary: client.systemBoundary,
    contractValueUSD: client.contractValueUSD,

    assessor: assessment.assessor,
    rpoFirm: client.rpoFirm,
    c3paoFirm: client.c3paoFirm,

    engagementStart: assessment.engagementStart,
    scheduledClose: assessment.scheduledClose,
    reportingPeriod: assessment.reportingPeriod,

    documentVersion: assessment.documentVersion,
    classification: assessment.classification,

    affirmingOfficial: assessment.affirmingOfficial,
    affirmingOfficialTitle: assessment.affirmingOfficialTitle,
    affirmingOfficialEmail: assessment.affirmingOfficialEmail,
    lastAffirmation: assessment.lastAffirmation,
    nextAffirmationDue: assessment.nextAffirmationDue,

    updatedAt: assessment.createdAt,
    updatedBy: assessment.createdBy
  };
}

/**
 * Persist engagement edits.
 *
 * Path A — active assessment exists: patch the assessment (assessor, dates,
 *   reporting period, document version, classification, affirmation) and
 *   patch the client (organization, CAGE, system boundary, firms, affirming
 *   official identity).
 *
 * Path B — no active assessment: patch the fallback JSON so /admin/engagement
 *   keeps working on a fresh deploy.
 */
export async function saveEngagement(
  updates: Partial<Engagement>,
  updatedBy: string
): Promise<Engagement> {
  const active = await loadActive();
  const cleaned: Partial<Engagement> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (typeof v === "string" && v.trim() === "" && !REQUIRED_FIELDS.has(k as keyof Engagement)) {
      continue;
    }
    (cleaned as Record<string, unknown>)[k] = v;
  }

  if (active.clientId && active.assessmentId) {
    const { updateClient } = await import("./clients");
    // Client-scope fields
    await updateClient(active.clientId, {
      organization: cleaned.organization,
      organizationLegal: cleaned.organizationLegal,
      cage: cleaned.cage,
      duns: cleaned.ducns,
      systemBoundary: cleaned.systemBoundary,
      contractValueUSD: cleaned.contractValueUSD,
      rpoFirm: cleaned.rpoFirm,
      c3paoFirm: cleaned.c3paoFirm,
      affirmingOfficial: cleaned.affirmingOfficial,
      affirmingOfficialTitle: cleaned.affirmingOfficialTitle,
      affirmingOfficialEmail: cleaned.affirmingOfficialEmail
    });
    // Assessment-scope fields
    await updateAssessment(
      active.assessmentId,
      {
        assessor: cleaned.assessor,
        engagementStart: cleaned.engagementStart,
        scheduledClose: cleaned.scheduledClose,
        reportingPeriod: cleaned.reportingPeriod,
        documentVersion: cleaned.documentVersion,
        classification: cleaned.classification,
        affirmingOfficial: cleaned.affirmingOfficial,
        affirmingOfficialTitle: cleaned.affirmingOfficialTitle,
        affirmingOfficialEmail: cleaned.affirmingOfficialEmail,
        lastAffirmation: cleaned.lastAffirmation,
        nextAffirmationDue: cleaned.nextAffirmationDue
      },
      updatedBy
    );
    return loadEngagement();
  }

  // Fallback record
  const current = await loadFallback();
  fallbackCache = {
    ...current,
    ...cleaned,
    updatedAt: new Date().toISOString(),
    updatedBy
  };
  if (writableFs) {
    writeLock = writeLock.then(async () => {
      if (!fallbackCache || !writableFs) return;
      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        const tmp = `${FALLBACK_PATH}.tmp-${process.pid}`;
        await fs.writeFile(tmp, JSON.stringify(fallbackCache, null, 2), "utf8");
        await fs.rename(tmp, FALLBACK_PATH);
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
          writableFs = false;
          console.warn(`[engagement] Filesystem read-only (${code}). In-memory only.`);
        } else {
          throw err;
        }
      }
    });
    await writeLock;
  }
  return fallbackCache;
}

const REQUIRED_FIELDS = new Set<keyof Engagement>([
  "organization",
  "organizationLegal",
  "cage",
  "systemBoundary",
  "assessor",
  "rpoFirm",
  "c3paoFirm",
  "engagementStart",
  "scheduledClose",
  "reportingPeriod",
  "documentVersion",
  "classification",
  "affirmingOfficial",
  "affirmingOfficialTitle",
  "nextAffirmationDue"
]);

/* ---------- helpers ---------- */

export function engagementOrgSlug(e: Engagement): string {
  return e.organization
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "client";
}

export function exportFileName(e: Engagement, docType: string, ext: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${engagementOrgSlug(e)}_${docType}_${date}.${ext}`;
}
