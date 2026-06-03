/**
 * Client (organization under engagement) store.
 *
 * A "client" is a contracted OSC that the RPO firm is assessing. One client
 * may have multiple assessments over time (annual recerts, surveillance,
 * remediation rounds). The portal can have many clients; the admin selects
 * which one is "active" — every cover sheet, watermark, filename, dashboard
 * card, and POA&M view then keys off the active client's active assessment.
 *
 * Persistence: file-backed JSON (.data/clients.json) with /tmp fallback on
 * Vercel and in-memory fallback on read-only filesystems — same pattern as
 * the auth store.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomBytes } from "crypto";

export type ClientContact = {
  name: string;
  email: string;
  title: string;
};

export type Client = {
  id: string;
  organization: string;        // display name
  organizationLegal: string;
  cage: string;
  duns?: string;
  systemBoundary: string;
  contractValueUSD?: number;
  primaryContact?: ClientContact;
  // Engagement defaults — copied into each new assessment created under this
  // client. Editing the client updates these but does NOT retro-edit existing
  // assessments (those carry frozen metadata so reports remain reproducible).
  rpoFirm: string;
  c3paoFirm: string;
  affirmingOfficial: string;
  affirmingOfficialTitle: string;
  affirmingOfficialEmail?: string;
  createdAt: string;
  createdBy: string;
  archived: boolean;
};

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "clients.json");

type Store = { clients: Record<string, Client> };

let cache: Store | null = null;
let writableFs = true;
let writeLock: Promise<void> = Promise.resolve();

/** Seed a default client so the portal isn't empty on first load. */
const DEFAULT_CLIENT: Client = {
  id: "cli_seed_northwind",
  organization: "Northwind Defense Systems",
  organizationLegal: "Northwind Defense Systems, LLC",
  cage: "1A2B3",
  systemBoundary: "CUI Enclave — Primary",
  rpoFirm: "CyberAutopsy LLC",
  c3paoFirm: "Veritas Cyber Assessors",
  affirmingOfficial: "C. Northwind",
  affirmingOfficialTitle: "Chief Executive Officer",
  createdAt: new Date(0).toISOString(),
  createdBy: "system",
  archived: false
};

export async function loadClients(): Promise<Client[]> {
  await ensureLoaded();
  return Object.values(cache!.clients).sort(
    (a, b) => (a.archived === b.archived ? a.organization.localeCompare(b.organization) : a.archived ? 1 : -1)
  );
}

export async function getClient(id: string): Promise<Client | null> {
  await ensureLoaded();
  return cache!.clients[id] ?? null;
}

export async function createClient(
  data: Omit<Client, "id" | "createdAt" | "createdBy" | "archived">,
  createdBy: string
): Promise<Client> {
  await ensureLoaded();
  const id = `cli_${randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();
  const client: Client = { ...data, id, createdAt: now, createdBy, archived: false };
  cache!.clients[id] = client;
  await persist();
  return client;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  await ensureLoaded();
  const existing = cache!.clients[id];
  if (!existing) throw new Error(`Client ${id} not found`);
  // Don't allow rewriting identity fields
  const { id: _id, createdAt: _ca, createdBy: _cb, ...allowed } = updates;
  void _id; void _ca; void _cb;
  const next = { ...existing, ...allowed };
  cache!.clients[id] = next;
  await persist();
  return next;
}

export async function archiveClient(id: string): Promise<void> {
  await updateClient(id, { archived: true });
}

export async function unarchiveClient(id: string): Promise<void> {
  await updateClient(id, { archived: false });
}

async function ensureLoaded(): Promise<void> {
  if (cache) return;
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    cache = JSON.parse(raw) as Store;
  } catch {
    cache = { clients: {} };
  }
  if (Object.keys(cache.clients).length === 0) {
    cache.clients[DEFAULT_CLIENT.id] = DEFAULT_CLIENT;
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
        console.warn(`[clients] Filesystem read-only (${code}). In-memory only.`);
      } else {
        throw err;
      }
    }
  });
  await writeLock;
}

export function clientSlug(c: Pick<Client, "organization">): string {
  return c.organization
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "client";
}
