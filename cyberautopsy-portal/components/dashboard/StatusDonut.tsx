"use client";

import type { ControlStatus } from "@/lib/types";
import { STATUS_COLOR } from "@/components/ui/StatusBadge";

type Props = { counts: Record<ControlStatus, number> };

const ORDER: ControlStatus[] = [
  "Implemented",
  "Under Review",
  "Partial",
  "Not Implemented",
  "Not Started",
  "Not Applicable"
];

export function StatusDonut({ counts }: Props) {
  const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
  const radius = 70;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;

  // Build offsets cumulatively
  let cursor = 0;
  const segments = ORDER.map((status) => {
    const value = counts[status];
    const ratio = value / total;
    const length = ratio * circumference;
    const dashArray = `${length} ${circumference - length}`;
    const dashOffset = -cursor;
    cursor += length;
    return { status, value, dashArray, dashOffset };
  });

  return (
    <section className="border border-ink-700 bg-ink-900 p-5">
      <header className="flex items-baseline justify-between">
        <div>
          <h2 className="font-serif text-lg text-bone-50">Control status</h2>
          <p className="text-xs text-bone-400">Distribution across the 110-control inventory</p>
        </div>
      </header>

      <div className="mt-5 grid items-center gap-6 sm:grid-cols-[180px_1fr]">
        <div className="relative mx-auto h-[180px] w-[180px]">
          <svg viewBox="0 0 180 180" className="-rotate-90">
            <circle cx="90" cy="90" r={radius} stroke="#1F1F24" strokeWidth={stroke} fill="none" />
            {segments.map((seg) =>
              seg.value > 0 ? (
                <circle
                  key={seg.status}
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke={STATUS_COLOR[seg.status]}
                  strokeWidth={stroke}
                  fill="none"
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="butt"
                />
              ) : null
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-serif text-3xl text-bone-50">{counts.Implemented}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
              of {total} met
            </div>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-2">
          {segments.map((s) => (
            <li
              key={s.status}
              className="flex items-center justify-between gap-3 border-b border-ink-700 pb-2 last:border-0 last:pb-0"
            >
              <span className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2" style={{ background: STATUS_COLOR[s.status] }} aria-hidden />
                <span className="text-bone-200">{s.status}</span>
              </span>
              <span className="font-mono text-xs text-bone-100">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
