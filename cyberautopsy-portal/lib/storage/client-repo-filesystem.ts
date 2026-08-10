/**
 * Filesystem ClientRepo — the pre-Back4App behaviour, extracted so it can
 * live behind the same interface as the Back4App implementation.
 *
 * Persistence at .data/clients.json with /tmp fallback on Vercel and
 * in-memory fallback when the filesystem goes read-only.
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomBytes } from "crypto";
import { DEFAULT_CLIENT, type Client, type ClientRepo } from "./client-types";

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), "cyberautopsy-data")
  : path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "clients.json");

type Store = { clients: Record<string, Client> };

let cache: Store | null = null;
let writableFs = true;
let writeLock: Promise<void> = Promise.resolve();

async function ensureLoaded(): Promise<Store> {
  if (cache) return cache;
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
  return cache;
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
        console.warn(`[clients/filesystem] Filesystem read-only (${code}). In-memory only.`);
      } else {
        throw err;
      }
    }
  });
  await writeLock;
}

export const filesystemClientRepo: ClientRepo = {
  async list() {
    const s = await ensureLoaded();
    return Object.values(s.clients).sort((a, b) =>
      a.archived === b.archived
        ? a.organization.localeCompare(b.organization)
        : a.archived
        ? 1
        : -1
    );
  },

  async get(id) {
    const s = await ensureLoaded();
    return s.clients[id] ?? null;
  },

  async create(data, createdBy) {
    const s = await ensureLoaded();
    const id = `cli_${randomBytes(6).toString("hex")}`;
    const now = new Date().toISOString();
    const client: Client = { ...data, id, createdAt: now, createdBy, archived: false };
    s.clients[id] = client;
    await persist();
    return client;
  },

  async update(id, updates) {
    const s = await ensureLoaded();
    const existing = s.clients[id];
    if (!existing) throw new Error(`Client ${id} not found`);
    const { id: _id, createdAt: _ca, createdBy: _cb, ...allowed } = updates;
    void _id; void _ca; void _cb;
    const next = { ...existing, ...allowed };
    s.clients[id] = next;
    await persist();
    return next;
  },

  async archive(id, archived = true) {
    await this.update(id, { archived });
  }
};
