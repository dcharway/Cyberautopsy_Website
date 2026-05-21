import { POAMKanban } from "@/components/poam/POAMKanban";
import { POAMS } from "@/data/poam";

export const metadata = { title: "POA&M · CyberAutopsy Portal" };

export default function POAMPage() {
  const total = POAMS.length;
  const open = POAMS.filter((p) => p.status === "Open").length;
  const inProgress = POAMS.filter((p) => p.status === "In Remediation").length;
  const review = POAMS.filter((p) => p.status === "Pending Review").length;
  const closed = POAMS.filter((p) => p.status === "Closed").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            PLAN OF ACTION &amp; MILESTONES
          </div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            POA&amp;M workflow.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-bone-300">
            Move items left to right as remediation progresses. CMMC 2.0 closure clock is
            <strong className="text-bone-100"> 180 days</strong> from certification — surfaced on each card.
          </p>
        </div>
        <button className="bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200">
          + New POA&amp;M
        </button>
      </header>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Open" value={open} accent="text-status-failed" />
        <Kpi label="In Remediation" value={inProgress} accent="text-status-partial" />
        <Kpi label="Pending Review" value={review} accent="text-status-review" />
        <Kpi label="Closed (this cycle)" value={closed} accent="text-status-met" />
      </div>

      {/* Board */}
      <POAMKanban items={POAMS} />

      <p className="text-xs text-bone-400">
        {total} POA&amp;Ms total. Use ← BACK / ADVANCE → on each card to move it across columns. CMMC 2.0
        permits POA&amp;Ms only on weight-1 controls and a limited subset of weight-3, never on weight-5.
      </p>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="border border-ink-700 bg-ink-900 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{label}</div>
      <div className={`mt-2 font-serif text-3xl ${accent}`}>{value}</div>
    </div>
  );
}
