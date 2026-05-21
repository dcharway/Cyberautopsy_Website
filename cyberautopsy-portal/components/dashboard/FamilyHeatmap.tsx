"use client";

import Link from "next/link";
import type { Control, FamilyCode } from "@/lib/types";
import { familyPosture, familySeverity } from "@/lib/analytics";
import { FAMILY_NAMES } from "@/data/controls110";
import { cn } from "@/lib/utils";

const SEVERITY: Record<ReturnType<typeof familySeverity>, string> = {
  met:     "border-status-met/60 bg-status-metBg",
  partial: "border-status-partial/60 bg-status-partialBg",
  failed:  "border-status-failed/60 bg-status-failedBg",
  review:  "border-status-review/60 bg-status-reviewBg"
};

export function FamilyHeatmap({ controls }: { controls: Control[] }) {
  const posture = familyPosture(controls);
  // Render in canonical NIST family order
  const order: FamilyCode[] = ["AC", "AT", "AU", "CM", "IA", "IR", "MA", "MP", "PS", "PE", "RA", "CA", "SC", "SI"];
  return (
    <section className="border border-ink-700 bg-ink-900 p-5">
      <header className="flex items-baseline justify-between">
        <div>
          <h2 className="font-serif text-lg text-bone-50">Family heatmap</h2>
          <p className="text-xs text-bone-400">14 NIST 800-171 families · click to drill</p>
        </div>
        <Link href="/controls" className="font-mono text-[11px] tracking-widest2 text-gold-300 hover:text-gold-100">
          ALL CONTROLS →
        </Link>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {order.map((code) => {
          const p = posture.get(code);
          if (!p) return null;
          const sev = familySeverity(p);
          const implPct = (p.impl / p.total) * 100;
          const partialPct = (p.partial / p.total) * 100;
          const missingPct = (p.missing / p.total) * 100;
          const reviewPct = (p.review / p.total) * 100;
          return (
            <Link
              key={code}
              href={`/controls?family=${code}`}
              className={cn("group block border bg-ink-950 p-3 transition hover:bg-ink-800", SEVERITY[sev])}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] tracking-widest2 text-bone-100">{code}</span>
                <span className="font-serif text-2xl text-bone-50">{p.total}</span>
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-bone-400 line-clamp-1">
                {FAMILY_NAMES[code]}
              </div>
              <div className="mt-2 flex h-1.5 overflow-hidden">
                <span className="bg-status-met" style={{ width: `${implPct}%` }} />
                <span className="bg-status-review" style={{ width: `${reviewPct}%` }} />
                <span className="bg-status-partial" style={{ width: `${partialPct}%` }} />
                <span className="bg-status-failed" style={{ width: `${missingPct}%` }} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1 font-mono text-[10px] text-bone-400">
                <span title="Implemented" className="text-status-met">{p.impl}</span>
                <span title="Partial" className="text-status-partial">{p.partial}</span>
                <span title="Missing" className="text-status-failed">{p.missing}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-4 border-t border-ink-700 pt-4">
        {[
          { c: "bg-status-met",    l: "Implemented" },
          { c: "bg-status-review", l: "Under Review" },
          { c: "bg-status-partial",l: "Partial" },
          { c: "bg-status-failed", l: "Not Implemented" }
        ].map((x) => (
          <span key={x.l} className="flex items-center gap-2 font-mono text-[10px] tracking-widest2 text-bone-400">
            <span className={`h-2 w-2 ${x.c}`} aria-hidden />
            {x.l.toUpperCase()}
          </span>
        ))}
      </div>
    </section>
  );
}
