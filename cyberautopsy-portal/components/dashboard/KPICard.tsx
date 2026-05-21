import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  unit?: string;
  trend?: { dir: "up" | "down" | "flat"; text: string };
  accent?: "gold" | "green" | "amber" | "red" | "blue";
  sub?: string;
};

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  gold: "text-gold-300",
  green: "text-status-met",
  amber: "text-status-partial",
  red: "text-status-failed",
  blue: "text-status-review"
};

export function KPICard({ label, value, unit, trend, accent = "gold", sub }: Props) {
  return (
    <div className="border border-ink-700 bg-ink-900 p-5">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
          {label}
        </span>
        {trend && (
          <span
            className={cn(
              "font-mono text-[10px] tracking-widest2",
              trend.dir === "up"
                ? "text-status-met"
                : trend.dir === "down"
                ? "text-status-failed"
                : "text-bone-400"
            )}
          >
            {trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "—"} {trend.text}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className={cn("font-serif text-5xl tracking-tightest text-bone-50", ACCENT[accent])}>
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-bone-400">{unit}</span>}
      </div>
      {sub && <div className="mt-2 text-xs text-bone-400">{sub}</div>}
    </div>
  );
}
