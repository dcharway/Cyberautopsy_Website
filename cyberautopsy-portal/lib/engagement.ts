/**
 * Engagement metadata — the customizable template fields used by every
 * exported document (org, CAGE, system boundary, assessor, dates, affirming
 * official). Single record per portal instance; admin edits via
 * /admin/engagement.
 *
 * Persistence mirrors the auth store: JSON file under .data/, with /tmp/
 * fallback on Vercel and in-memory fallback on read-only filesystems.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";

export type Engagement = {
  // --- Client identity ---
  organization: string;        // e.g. "Northwind Defense Systems"
  organizationLegal: string;   // e.g. "Northwind Defense Systems, LLC"
  cage: string;                // CAGE code
  ducns?: string;              // optional D-U-N-S
  systemBoundary: string;      // e.g. "CUI Enclave — Primary"
  contractValueUSD?: number;

  // --- Engagement parties ---
  assessor: string;            // RPO compliance surgeon name
  rpoFirm: string;             // default: "CyberAutopsy LLC"
  c3paoFirm: string;           // accredited C3PAO partner name

  // --- Dates ---
  engagementStart: string;     // ISO date
  scheduledClose: string;      // ISO date — target audit-ready
  reportingPeriod: string;     // free-form, e.g. "2026-Q2"

  // --- Document branding defaults ---
  documentVersion: string;     // "v1.0"
  classification: string;      // "Controlled Unclassified Information (CUI)"

  // --- Annual affirmation ---
  affirmingOfficial: string;          // name of senior officer
  affirmingOfficialTitle: string;     // e.g. "Chief Executive Officer"
  affirmingOfficialEmail?: string;
  lastAffirmation: string | null;     // ISO date
  nextAffirmationDue: string;         // ISO date

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
const STORE_PATH = path.join(DATA_DIR, "engagement.json");

let cache: Engagement | null = null;
let writableFs = true;
let writeLock: Promise<void> = Promise.resolve();

export async function loadEngagement(): Promise<Engagement> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    cache = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Engagement>) };
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
}

export async function saveEngagement(
  updates: Partial<Engagement>,
  updatedBy: string
): Promise<Engagement> {
  const current = await loadEngagement();
  // Coerce empty strings to undefined for optional fields so they don't
  // overwrite genuine values with blanks.
  const cleaned: Partial<Engagement> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (typeof v === "string" && v.trim() === "" && !REQUIRED_FIELDS.has(k as keyof Engagement)) {
      continue;
    }
    (cleaned as Record<string, unknown>)[k] = v;
  }
  cache = {
    ...current,
    ...cleaned,
    updatedAt: new Date().toISOString(),
    updatedBy
  };
  if (writableFs) {
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
          console.warn(`[engagement] Filesystem read-only (${code}). In-memory only.`);
        } else {
          throw err;
        }
      }
    });
    await writeLock;
  }
  return cache;
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

/**
 * Canonical export filename per the PRD:
 *   {ClientSlug}_{DocumentType}_{YYYY-MM-DD}.{ext}
 *
 * Example: northwind-defense-systems_SSP-Appendix-D_2026-06-03.xlsx
 */
export function exportFileName(e: Engagement, docType: string, ext: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${engagementOrgSlug(e)}_${docType}_${date}.${ext}`;
}
