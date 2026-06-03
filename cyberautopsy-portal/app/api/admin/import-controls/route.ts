import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require";
import type { ControlStatus, FamilyCode } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only: bulk import / update the 110-control posture from a CSV.
 *
 * Accepts text/csv body OR application/json { csv: string }.
 *
 * CSV format (header row required):
 *   Control ID,Status,Owner,Narrative
 *   3.1.1,Implemented,J. Smith,"Configured AD groups…"
 *   3.1.2,Partial,A. Lee,"Working through edge cases"
 *
 * Returns the parsed delta (no persistence yet — the existing seed data is
 * static. This endpoint is the wire-up; persisting changes will follow once
 * we move CONTROLS to a database in a later commit).
 */

const VALID_STATUS = new Set<ControlStatus>([
  "Implemented",
  "Partial",
  "Not Implemented",
  "Not Applicable",
  "Not Started",
  "Under Review"
]);

type RowUpdate = {
  id: string;
  family?: FamilyCode;
  status?: ControlStatus;
  owner?: string;
  narrative?: string;
};

type ParseResult = {
  ok: boolean;
  rows: RowUpdate[];
  errors: { line: number; message: string }[];
};

export async function POST(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  let csv: string;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as { csv?: string };
    csv = body.csv ?? "";
  } else {
    csv = await req.text();
  }

  if (!csv.trim()) {
    return NextResponse.json({ error: "Empty CSV body" }, { status: 400 });
  }

  const parsed = parseCsv(csv);
  if (parsed.errors.length > 0 && parsed.rows.length === 0) {
    return NextResponse.json(
      { error: "CSV could not be parsed", details: parsed.errors },
      { status: 400 }
    );
  }

  // In-memory result. Persistence is intentionally absent — the current
  // 110-control registry is a TypeScript seed (data/controls110.ts) that
  // gets read on each render. Persisting changes requires migrating to a
  // database, which is the next planned step.
  return NextResponse.json(
    {
      ok: true,
      summary: {
        rowsAccepted: parsed.rows.length,
        rowsRejected: parsed.errors.length
      },
      rows: parsed.rows.slice(0, 25), // first 25 only — enough to confirm parse
      errors: parsed.errors,
      note:
        "Parse succeeded but the in-portal control registry is a static seed in " +
        "this build. Persistence ships in the next migration when controls move " +
        "to the database layer."
    },
    { status: 200 }
  );
}

/* ---------- CSV parser (minimal, RFC-4180-shaped) ---------- */

function parseCsv(text: string): ParseResult {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.length > 0);
  if (lines.length < 2) {
    return { ok: false, rows: [], errors: [{ line: 0, message: "CSV needs a header row + at least one data row" }] };
  }
  const header = splitCsvLine(lines[0]).map((c) => c.trim().toLowerCase());

  const idxControl  = header.findIndex((c) => c === "control id" || c === "controlid" || c === "id");
  const idxStatus   = header.findIndex((c) => c === "status" || c === "implementation status");
  const idxOwner    = header.findIndex((c) => c === "owner");
  const idxNarr     = header.findIndex((c) => c === "narrative" || c === "implementation narrative");

  if (idxControl < 0 || idxStatus < 0) {
    return {
      ok: false,
      rows: [],
      errors: [{ line: 0, message: "Header must include at minimum 'Control ID' and 'Status' columns" }]
    };
  }

  const rows: RowUpdate[] = [];
  const errors: ParseResult["errors"] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const id = (cells[idxControl] ?? "").trim();
    const status = (cells[idxStatus] ?? "").trim() as ControlStatus;
    const owner = idxOwner >= 0 ? (cells[idxOwner] ?? "").trim() || undefined : undefined;
    const narrative = idxNarr >= 0 ? (cells[idxNarr] ?? "").trim() || undefined : undefined;

    if (!id) {
      errors.push({ line: i + 1, message: "Missing Control ID" });
      continue;
    }
    if (!/^\d+\.\d+\.\d+$/.test(id)) {
      errors.push({ line: i + 1, message: `Control ID '${id}' is not in 3.x.y format` });
      continue;
    }
    if (status && !VALID_STATUS.has(status)) {
      errors.push({
        line: i + 1,
        message: `Status '${status}' is not one of ${[...VALID_STATUS].join(", ")}`
      });
      continue;
    }
    rows.push({ id, status, owner, narrative });
  }

  return { ok: errors.length === 0, rows, errors };
}

/**
 * Splits a single CSV line, honoring double-quoted fields with embedded
 * commas and "" escapes. Doesn't support multi-line quoted fields.
 */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === ",") {
        out.push(cur);
        cur = "";
      } else if (ch === '"' && cur.length === 0) {
        inQuotes = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}
