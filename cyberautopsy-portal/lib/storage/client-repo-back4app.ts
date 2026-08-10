/**
 * Back4App ClientRepo — Parse-backed implementation.
 *
 * Parse class: "CyberClient" (avoids collision with Parse's built-in _User /
 * Session classes and reserved names like "Client"). Each row is one client;
 * we key on a `cyberId` string column (matches our "cli_..." IDs) so the
 * portal's own IDs stay stable across backend swaps.
 *
 * Master key is used for every read/write from this server — the Node process
 * IS the trusted admin. Row-level ACLs stay open on the class since
 * discovery + edits are already gated by requireAdmin() at the API layer.
 *
 * On first use, seeds the default Northwind client if the class is empty —
 * matches the filesystem adapter's behaviour so the seed pattern is uniform.
 */

import { randomBytes } from "crypto";
import type Parse from "parse/node";
import { getParse, withMasterKey } from "./parse-init";
import { DEFAULT_CLIENT, type Client, type ClientRepo, type ClientContact } from "./client-types";

const CLASS_NAME = "CyberClient";
let seedChecked = false;

function requireParse(): typeof Parse {
  const p = getParse();
  if (!p) {
    throw new Error(
      "Back4App is not initialised. Set STORAGE_BACKEND=back4app and BACK4APP_APP_ID / BACK4APP_JAVASCRIPT_KEY / BACK4APP_MASTER_KEY."
    );
  }
  return p;
}

/** Project a Parse.Object back to our plain Client shape. */
function fromParse(obj: Parse.Object): Client {
  const primary = obj.get("primaryContact") as ClientContact | undefined;
  return {
    id: obj.get("cyberId") as string,
    organization: obj.get("organization") as string,
    organizationLegal: obj.get("organizationLegal") as string,
    cage: obj.get("cage") as string,
    duns: obj.get("duns") as string | undefined,
    systemBoundary: obj.get("systemBoundary") as string,
    contractValueUSD: obj.get("contractValueUSD") as number | undefined,
    primaryContact: primary ?? undefined,
    rpoFirm: obj.get("rpoFirm") as string,
    c3paoFirm: obj.get("c3paoFirm") as string,
    affirmingOfficial: obj.get("affirmingOfficial") as string,
    affirmingOfficialTitle: obj.get("affirmingOfficialTitle") as string,
    affirmingOfficialEmail: obj.get("affirmingOfficialEmail") as string | undefined,
    createdAt: (obj.get("cyberCreatedAt") as string) || obj.get("createdAt").toISOString(),
    createdBy: obj.get("createdBy") as string,
    archived: Boolean(obj.get("archived"))
  };
}

/** Merge our plain Client onto a Parse.Object for save. */
function applyTo(obj: Parse.Object, c: Partial<Client> & { id?: string }): void {
  const setIf = <T,>(key: string, v: T | undefined) => {
    if (v !== undefined) obj.set(key, v as unknown);
  };
  setIf("cyberId", c.id);
  setIf("organization", c.organization);
  setIf("organizationLegal", c.organizationLegal);
  setIf("cage", c.cage);
  setIf("duns", c.duns);
  setIf("systemBoundary", c.systemBoundary);
  setIf("contractValueUSD", c.contractValueUSD);
  setIf("primaryContact", c.primaryContact);
  setIf("rpoFirm", c.rpoFirm);
  setIf("c3paoFirm", c.c3paoFirm);
  setIf("affirmingOfficial", c.affirmingOfficial);
  setIf("affirmingOfficialTitle", c.affirmingOfficialTitle);
  setIf("affirmingOfficialEmail", c.affirmingOfficialEmail);
  setIf("cyberCreatedAt", c.createdAt);
  setIf("createdBy", c.createdBy);
  setIf("archived", c.archived);
}

async function findByCyberId(cyberId: string): Promise<Parse.Object | null> {
  const P = requireParse();
  const q = new P.Query(CLASS_NAME);
  q.equalTo("cyberId", cyberId);
  const obj = await q.first(withMasterKey);
  return obj ?? null;
}

async function ensureSeed(): Promise<void> {
  if (seedChecked) return;
  seedChecked = true;
  const P = requireParse();
  const q = new P.Query(CLASS_NAME);
  q.limit(1);
  const anyClient = await q.first(withMasterKey);
  if (anyClient) return;
  const obj = new P.Object(CLASS_NAME);
  applyTo(obj, DEFAULT_CLIENT);
  await obj.save(null, withMasterKey);
  console.info(`[clients/back4app] Seeded default client "${DEFAULT_CLIENT.organization}".`);
}

export const back4appClientRepo: ClientRepo = {
  async list() {
    const P = requireParse();
    await ensureSeed();
    const q = new P.Query(CLASS_NAME);
    q.limit(1000);
    const rows = await q.find(withMasterKey);
    return rows.map(fromParse).sort((a, b) =>
      a.archived === b.archived
        ? a.organization.localeCompare(b.organization)
        : a.archived
        ? 1
        : -1
    );
  },

  async get(id) {
    await ensureSeed();
    const obj = await findByCyberId(id);
    return obj ? fromParse(obj) : null;
  },

  async create(data, createdBy) {
    const P = requireParse();
    await ensureSeed();
    const id = `cli_${randomBytes(6).toString("hex")}`;
    const now = new Date().toISOString();
    const client: Client = { ...data, id, createdAt: now, createdBy, archived: false };
    const obj = new P.Object(CLASS_NAME);
    applyTo(obj, client);
    await obj.save(null, withMasterKey);
    return client;
  },

  async update(id, updates) {
    const obj = await findByCyberId(id);
    if (!obj) throw new Error(`Client ${id} not found`);
    const existing = fromParse(obj);
    // Preserve identity fields exactly like the filesystem adapter does.
    const { id: _id, createdAt: _ca, createdBy: _cb, ...allowed } = updates;
    void _id; void _ca; void _cb;
    const next: Client = { ...existing, ...allowed };
    applyTo(obj, next);
    await obj.save(null, withMasterKey);
    return next;
  },

  async archive(id, archived = true) {
    await this.update(id, { archived });
  }
};
