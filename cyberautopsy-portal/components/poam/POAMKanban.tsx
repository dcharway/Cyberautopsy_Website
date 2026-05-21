"use client";

import { useState } from "react";
import { Plus, Calendar, User, AlertCircle } from "lucide-react";
import type { POAM } from "@/lib/types";
import { cn } from "@/lib/utils";

type Column = POAM["status"];

const COLUMNS: { key: Column; label: string; tone: string }[] = [
  { key: "Open",            label: "Open",             tone: "border-status-failed/50" },
  { key: "In Remediation",  label: "In Remediation",   tone: "border-status-partial/50" },
  { key: "Pending Review",  label: "Pending Review",   tone: "border-status-review/50" },
  { key: "Closed",          label: "Closed",           tone: "border-status-met/50" }
];

const RISK_STYLE: Record<POAM["risk"], string> = {
  High:   "border-status-failed/60 text-status-failed",
  Medium: "border-status-partial/60 text-status-partial",
  Low:    "border-status-met/60 text-status-met"
};

export function POAMKanban({ items }: { items: POAM[] }) {
  const [poams, setPoams] = useState(items);

  function moveItem(id: string, to: Column) {
    setPoams((prev) => prev.map((p) => (p.id === id ? { ...p, status: to } : p)));
  }

  const byColumn: Record<Column, POAM[]> = {
    Open: [],
    "In Remediation": [],
    "Pending Review": [],
    Closed: []
  };
  poams.forEach((p) => byColumn[p.status].push(p));

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {COLUMNS.map((col) => (
        <section
          key={col.key}
          className={cn("flex flex-col rounded-sm border bg-ink-900", col.tone)}
        >
          <header className="flex items-center justify-between border-b border-ink-700 p-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-bone-100">
                {col.label}
              </span>
              <span className="font-mono text-[10px] text-bone-400 border border-ink-700 px-1.5 py-0.5">
                {byColumn[col.key].length}
              </span>
            </div>
            <button
              aria-label={`Add to ${col.label}`}
              className="text-bone-400 hover:text-gold-300"
            >
              <Plus size={14} />
            </button>
          </header>

          <ul className="flex-1 space-y-2 p-3 min-h-[200px]">
            {byColumn[col.key].map((p) => (
              <li key={p.id}>
                <Card poam={p} onMove={moveItem} />
              </li>
            ))}
            {byColumn[col.key].length === 0 && (
              <li className="text-center text-[11px] text-bone-500 py-8">
                No items
              </li>
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Card({ poam, onMove }: { poam: POAM; onMove: (id: string, to: Column) => void }) {
  const closeDate = new Date(poam.scheduledClose);
  const daysToClose = Math.ceil((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const overdue = daysToClose < 0;
  const dueSoon = daysToClose >= 0 && daysToClose < 14;

  // Compute next/prev column for move buttons
  const nextCol: Record<Column, Column | null> = {
    Open: "In Remediation",
    "In Remediation": "Pending Review",
    "Pending Review": "Closed",
    Closed: null
  };
  const prevCol: Record<Column, Column | null> = {
    Open: null,
    "In Remediation": "Open",
    "Pending Review": "In Remediation",
    Closed: "Pending Review"
  };

  return (
    <article className="border border-ink-700 bg-ink-950 p-3 hover:border-gold-300/40 transition">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-widest2 text-gold-300">{poam.id}</span>
        <span className={cn("border px-1.5 py-0.5 font-mono text-[9px] tracking-widest2", RISK_STYLE[poam.risk])}>
          {poam.risk.toUpperCase()}
        </span>
      </div>

      <div className="mt-2 font-mono text-[11px] text-bone-100">CONTROL · {poam.controlId}</div>
      <p className="mt-2 line-clamp-3 text-xs text-bone-200">{poam.weakness}</p>

      <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-bone-400">
        <span className="flex items-center gap-1">
          <User size={11} /> {poam.owner}
        </span>
        <span
          className={cn(
            "flex items-center gap-1",
            overdue ? "text-status-failed" : dueSoon ? "text-status-partial" : "text-bone-400"
          )}
        >
          {overdue && <AlertCircle size={11} />}
          <Calendar size={11} /> {poam.scheduledClose}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-700 pt-2">
        <button
          disabled={prevCol[poam.status] === null}
          onClick={() => prevCol[poam.status] && onMove(poam.id, prevCol[poam.status] as Column)}
          className="font-mono text-[10px] tracking-widest2 text-bone-400 hover:text-bone-100 disabled:opacity-40 disabled:hover:text-bone-400"
        >
          ← BACK
        </button>
        <button
          disabled={nextCol[poam.status] === null}
          onClick={() => nextCol[poam.status] && onMove(poam.id, nextCol[poam.status] as Column)}
          className="font-mono text-[10px] tracking-widest2 text-gold-300 hover:text-gold-100 disabled:opacity-40 disabled:hover:text-gold-300"
        >
          ADVANCE →
        </button>
      </div>
    </article>
  );
}
