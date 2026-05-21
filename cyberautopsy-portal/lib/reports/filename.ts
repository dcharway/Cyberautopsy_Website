import { ORG } from "@/lib/utils";

const ORG_SLUG = ORG.name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

function isoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function reportFileName(prefix: string, ext: string): string {
  return `${prefix}_${ORG_SLUG}_${isoDate()}.${ext}`;
}
