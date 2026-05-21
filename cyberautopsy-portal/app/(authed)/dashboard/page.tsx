import { CONTROLS } from "@/data/controls110";
import { countByStatus, sprsScore } from "@/lib/analytics";
import { KPICard } from "@/components/dashboard/KPICard";
import { FamilyHeatmap } from "@/components/dashboard/FamilyHeatmap";
import { StatusDonut } from "@/components/dashboard/StatusDonut";
import { BurndownChart } from "@/components/dashboard/BurndownChart";
import { AssessorRequests } from "@/components/dashboard/AssessorRequests";
import { ORG } from "@/lib/utils";

export const metadata = { title: "Overview · CyberAutopsy Portal" };

export default function DashboardPage() {
  const counts = countByStatus(CONTROLS);
  const score = sprsScore(CONTROLS);
  const openPOAMs = CONTROLS.filter((c) => c.poamId).length;
  const dueAffirmation = Math.ceil(
    (new Date(ORG.affirmationDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            OVERVIEW · {ORG.systemBoundary}
          </div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            Compliance posture, <span className="gold-text">live.</span>
          </h1>
          <p className="mt-2 text-sm text-bone-300">
            CMMC Level 2 · 110 controls · {ORG.c3pao} · {ORG.activeAssessment}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ToolbarButton label="Refresh data" />
          <ToolbarButton label="Generate exec brief" />
          <ToolbarButton label="Build packet" primary />
        </div>
      </header>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KPICard
          label="SPRS Score"
          value={score}
          unit="/ 110"
          accent={score >= 88 ? "green" : "red"}
          trend={{ dir: "up", text: "+7 in 30d" }}
          sub={score >= 88 ? "Above CMMC 2.0 minimum (88)" : "Below CMMC 2.0 minimum (88)"}
        />
        <KPICard
          label="Controls Met"
          value={`${counts.Implemented}/110`}
          accent="green"
          trend={{ dir: "up", text: "+4 in 30d" }}
          sub="Implemented per NIST 800-171A"
        />
        <KPICard
          label="Partial / Under Review"
          value={counts.Partial + counts["Under Review"]}
          accent="amber"
          sub={`${counts.Partial} partial · ${counts["Under Review"]} under review`}
        />
        <KPICard
          label="Open POA&Ms"
          value={openPOAMs}
          accent="red"
          trend={{ dir: "down", text: "−3 in 30d" }}
          sub="Avg age 27d · 180d clock starts at cert"
        />
        <KPICard
          label="Affirmation Due"
          value={`${dueAffirmation}d`}
          accent="gold"
          sub={`${ORG.affirmationDue} · last on ${ORG.lastAffirmation}`}
        />
      </div>

      {/* Heatmap + Donut */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <FamilyHeatmap controls={CONTROLS} />
        <StatusDonut counts={counts} />
      </div>

      {/* Burndown + Assessor requests */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BurndownChart />
        <AssessorRequests />
      </div>
    </div>
  );
}

function ToolbarButton({ label, primary = false }: { label: string; primary?: boolean }) {
  return (
    <button
      type="button"
      className={
        primary
          ? "bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200"
          : "border border-ink-700 bg-ink-900 px-4 py-2 text-xs text-bone-200 hover:border-bone-300"
      }
    >
      {label}
    </button>
  );
}
