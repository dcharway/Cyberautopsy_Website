/**
 * Canonical export filename helper.
 *
 * Per PRD §6.6 ("Standardized File Naming"):
 *   {ClientSlug}_{DocumentType}_{YYYY-MM-DD}.{ext}
 *
 * Pulls the client slug from live engagement metadata (admin-editable),
 * not the static ORG constant. The async variant is preferred for routes
 * that have already loaded engagement; the sync ORG-only fallback exists
 * for code paths that cannot await.
 */

import { ORG } from "@/lib/utils";
import { engagementOrgSlug, loadEngagement } from "@/lib/engagement";

const FALLBACK_ORG_SLUG = ORG.name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

function isoDate() {
  return new Date().toISOString().slice(0, 10);
}

/** Sync fallback — uses the static ORG name. Prefer reportFileNameLive. */
export function reportFileName(prefix: string, ext: string): string {
  return `${prefix}_${FALLBACK_ORG_SLUG}_${isoDate()}.${ext}`;
}

/**
 * Live engagement-aware filename. Use this in all admin export routes so
 * renaming the client in /admin/engagement immediately reflects in every
 * downloaded file.
 */
export async function reportFileNameLive(prefix: string, ext: string): Promise<string> {
  const e = await loadEngagement();
  return `${prefix}_${engagementOrgSlug(e)}_${isoDate()}.${ext}`;
}
