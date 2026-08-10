/**
 * Client repository — storage-agnostic interface for the Client entity.
 *
 * Two backends implement it:
 *   - client-repo-filesystem.ts : legacy JSON file at .data/clients.json
 *   - client-repo-back4app.ts   : Parse "Client" class hosted on Back4App
 *
 * A factory picks based on the STORAGE_BACKEND env var. Callers import from
 * this module only; they never see the backend directly. This keeps every
 * store's business logic (validation, seeding, slug helpers) in one place.
 */

import { useBack4App } from "./parse-init";
import type { ClientRepo, Client } from "./client-types";
import { filesystemClientRepo } from "./client-repo-filesystem";
import { back4appClientRepo } from "./client-repo-back4app";

export function getClientRepo(): ClientRepo {
  return useBack4App() ? back4appClientRepo : filesystemClientRepo;
}

// Re-export the entity so callers only need to import from one place.
export type { ClientContact, Client, ClientRepo } from "./client-types";

/** Human-readable name for the currently active backend — used by the
 *  /admin diagnostics tile and PM2 startup logs. */
export function activeStorageBackend(): "filesystem" | "back4app" {
  return useBack4App() ? "back4app" : "filesystem";
}

/** URL-safe slug for a client's display name. Used by export filenames + URLs. */
export function clientSlug(c: Pick<Client, "organization">): string {
  return c.organization
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "client";
}
