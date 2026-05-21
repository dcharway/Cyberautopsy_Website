import { cn } from "@/lib/utils";
import type { ControlStatus } from "@/lib/types";

const STYLES: Record<ControlStatus, { className: string; label: string }> = {
  Implemented:        { className: "border-status-met/60 bg-status-metBg text-status-met",          label: "Implemented" },
  Partial:            { className: "border-status-partial/60 bg-status-partialBg text-status-partial", label: "Partial" },
  "Not Implemented":  { className: "border-status-failed/60 bg-status-failedBg text-status-failed",  label: "Not Implemented" },
  "Not Applicable":   { className: "border-status-na/60 bg-status-naBg text-status-na",              label: "N/A" },
  "Not Started":      { className: "border-status-notStarted/60 bg-status-notStartedBg text-status-notStarted", label: "Not Started" },
  "Under Review":     { className: "border-status-review/60 bg-status-reviewBg text-status-review",  label: "Under Review" }
};

export function StatusBadge({ status, dense = false }: { status: ControlStatus; dense?: boolean }) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border font-mono uppercase tracking-widest2",
        dense ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]",
        s.className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {s.label}
    </span>
  );
}

export const STATUS_COLOR: Record<ControlStatus, string> = {
  Implemented: "#16A34A",
  Partial: "#F59E0B",
  "Not Implemented": "#DC2626",
  "Not Applicable": "#71717A",
  "Not Started": "#6B7280",
  "Under Review": "#2563EB"
};
