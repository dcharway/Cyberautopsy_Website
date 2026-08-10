/**
 * Client store — backend-agnostic public API.
 *
 * The persistence backend (filesystem JSON vs. Back4App Parse) is picked at
 * runtime by lib/storage/client-repo.ts based on the STORAGE_BACKEND env var.
 * Callers never see the backend directly — they use these functions.
 *
 * A "client" is a contracted OSC that the RPO firm is assessing. One client
 * may have multiple assessments over time (annual recerts, surveillance,
 * remediation rounds). The portal can have many clients; the admin selects
 * which one is "active" — every cover sheet, watermark, filename, dashboard
 * card, and POA&M view then keys off the active client's active assessment.
 */

import { getClientRepo } from "./storage/client-repo";
import type { Client } from "./storage/client-types";

// Re-export types so existing imports (`import type { Client } from "@/lib/clients"`) keep working.
export type { ClientContact, Client } from "./storage/client-types";
export { clientSlug, activeStorageBackend } from "./storage/client-repo";

export async function loadClients(): Promise<Client[]> {
  return getClientRepo().list();
}

export async function getClient(id: string): Promise<Client | null> {
  return getClientRepo().get(id);
}

export async function createClient(
  data: Omit<Client, "id" | "createdAt" | "createdBy" | "archived">,
  createdBy: string
): Promise<Client> {
  return getClientRepo().create(data, createdBy);
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  return getClientRepo().update(id, updates);
}

export async function archiveClient(id: string): Promise<void> {
  return getClientRepo().archive(id, true);
}

export async function unarchiveClient(id: string): Promise<void> {
  return getClientRepo().archive(id, false);
}
