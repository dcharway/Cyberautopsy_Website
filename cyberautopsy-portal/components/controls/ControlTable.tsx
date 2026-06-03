"use client";

import { useMemo, useState } from "react";
import { Filter, Search, ChevronRight } from "lucide-react";
import type { Control, ControlStatus, FamilyCode } from "@/lib/types";
import type { EvidenceItem } from "@/lib/evidence-store";
import type { POAMItem } from "@/lib/poam-store";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ControlDrawer } from "./ControlDrawer";
import { FAMILY_NAMES } from "@/data/controls110";
import { cn } from "@/lib/utils";

type Props = {
  controls: Control[];
  defaultFamily?: FamilyCode | "ALL";
  canEdit?: boolean;
  assessmentId?: string | null;
  evidence?: EvidenceItem[];
  poams?: POAMItem[];
};

const STATUS_FILTERS: (ControlStatus | "ALL")[] = [
  "ALL",
  "Implemented",
  "Partial",
  "Not Implemented",
  "Not Started",
  "Under Review"
];

export function ControlTable({
  controls: initialControls,
  defaultFamily = "ALL",
  canEdit = false,
  assessmentId = null,
  evidence = [],
  poams = []
}: Props) {
  const [controls, setControls] = useState(initialControls);
  const [family, setFamily] = useState<FamilyCode | "ALL">(defaultFamily);
  const [status, setStatus] = useState<ControlStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Control | null>(null);

  function applyUpdate(controlId: string, patch: Partial<Control>) {
    setControls((prev) => prev.map((c) => (c.id === controlId ? { ...c, ...patch } : c)));
    setSelected((prev) => (prev && prev.id === controlId ? { ...prev, ...patch } : prev));
  }

  const families = useMemo(() => {
    const set = new Set<FamilyCode>();
    controls.forEach((c) => set.add(c.family));
    return Array.from(set);
  }, [controls]);

  const filtered = useMemo(() => {
    return controls.filter((c) => {
      if (family !== "ALL" && c.family !== family) return false;
      if (status !== "ALL" && c.status !== status) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.id.toLowerCase().includes(q) &&
          !c.name.toLowerCase().includes(q) &&
          !c.requirement.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [controls, family, status, query]);

  return (
    <>
      {/* Filter bar */}
      <div className="border border-ink-700 bg-ink-900">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-700 p-3">
          <div className="flex items-center gap-2 border border-ink-700 bg-ink-950 px-3 py-1.5">
            <Search size={14} className="text-bone-400" />
            <input
              type="search"
              placeholder="Search by ID, name, requirement…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-72 bg-transparent text-sm text-bone-100 placeholder:text-bone-400 focus:outline-none"
              aria-label="Search controls"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Filter size={13} className="text-bone-400" />
            <span className="font-mono text-[10px] tracking-widest2 text-bone-400">FILTER</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-3">
          <FilterGroup label="Family">
            <Chip active={family === "ALL"} onClick={() => setFamily("ALL")}>
              All
            </Chip>
            {families.map((f) => (
              <Chip key={f} active={family === f} onClick={() => setFamily(f)}>
                {f}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Status">
            {STATUS_FILTERS.map((s) => (
              <Chip
                key={s}
                active={status === s}
                onClick={() => setStatus(s as ControlStatus | "ALL")}
              >
                {s === "ALL" ? "All" : s}
              </Chip>
            ))}
          </FilterGroup>
        </div>

        <div className="flex items-center justify-between border-t border-ink-700 px-4 py-2 font-mono text-[10px] tracking-widest2 text-bone-400">
          <span>SHOWING {filtered.length} / {controls.length} CONTROLS</span>
          <span>{family === "ALL" ? "ALL FAMILIES" : `${family} · ${FAMILY_NAMES[family]}`}</span>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto border border-ink-700 bg-ink-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-700 bg-ink-950 text-left">
              <Th className="w-24">ID</Th>
              <Th className="w-16">Family</Th>
              <Th>Control name</Th>
              <Th className="w-32">Status</Th>
              <Th className="w-20">Weight</Th>
              <Th className="w-32">Owner</Th>
              <Th className="w-20">POA&M</Th>
              <Th className="w-32">Last review</Th>
              <Th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSelected(c)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(c);
                  }
                }}
                tabIndex={0}
                className="cursor-pointer border-b border-ink-700/60 transition hover:bg-ink-800 focus:bg-ink-800 focus:outline-none"
              >
                <Td>
                  <span className="font-mono text-xs text-bone-100">{c.id}</span>
                </Td>
                <Td>
                  <span className="font-mono text-[11px] tracking-widest2 text-gold-300">{c.family}</span>
                </Td>
                <Td>
                  <div className="text-sm text-bone-100">{c.name}</div>
                  <div className="mt-0.5 line-clamp-1 text-[11px] text-bone-400">{c.requirement}</div>
                </Td>
                <Td>
                  <StatusBadge status={c.status} dense />
                </Td>
                <Td>
                  <span className="font-mono text-xs text-bone-300">{c.weight}</span>
                </Td>
                <Td>
                  <span className="text-xs text-bone-200">{c.owner ?? "—"}</span>
                </Td>
                <Td>
                  {c.poamId ? (
                    <span className="font-mono text-[10px] tracking-widest2 text-status-partial">
                      {c.poamId.replace("POAM-", "")}
                    </span>
                  ) : (
                    <span className="text-bone-500">—</span>
                  )}
                </Td>
                <Td>
                  <span className="font-mono text-[11px] text-bone-400">{c.lastReviewed ?? "—"}</span>
                </Td>
                <Td>
                  <ChevronRight size={14} className="text-bone-400" />
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-12 text-center text-sm text-bone-400">
                  No controls match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ControlDrawer
        control={selected}
        onClose={() => setSelected(null)}
        canEdit={canEdit}
        assessmentId={assessmentId}
        evidence={evidence.filter((e) => selected ? e.controlIds.includes(selected.id) : false)}
        poam={selected ? poams.find((p) => p.controlId === selected.id) ?? null : null}
        onUpdate={applyUpdate}
      />
    </>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-bone-400", className)}>
      {children}
    </th>
  );
}

function Td({ children }: { children?: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{label}</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border px-2.5 py-1 text-[11px] transition",
        active
          ? "border-gold-300 bg-gold-300/10 text-gold-100"
          : "border-ink-700 text-bone-300 hover:border-bone-300"
      )}
    >
      {children}
    </button>
  );
}
