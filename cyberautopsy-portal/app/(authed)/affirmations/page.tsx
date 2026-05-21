import { ShieldCheck, Calendar, FileCheck2 } from "lucide-react";
import { ORG } from "@/lib/utils";

export const metadata = { title: "Affirmations · CyberAutopsy Portal" };

type Affirmation = {
  cycle: string;
  affirmedOn: string;
  affirmer: string;
  score: number;
  status: "Active" | "Lapsed" | "Pending";
  notes?: string;
};

const HISTORY: Affirmation[] = [
  { cycle: "2025–2026", affirmedOn: "2025-08-12", affirmer: "C. Northwind (CEO)", score: 92, status: "Active", notes: "Filed within 7 days of CMMC L2 certificate." },
  { cycle: "2024–2025", affirmedOn: "2024-08-10", affirmer: "C. Northwind (CEO)", score: 89, status: "Lapsed", notes: "Re-certified during this cycle." },
  { cycle: "2023–2024", affirmedOn: "2023-08-15", affirmer: "G. Vargas (CIO)",    score: 84, status: "Lapsed", notes: "Pre-CMMC 2.0; voluntary SPRS only." }
];

export default function AffirmationsPage() {
  const dueIn = Math.ceil(
    (new Date(ORG.affirmationDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
          ANNUAL AFFIRMATION
        </div>
        <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
          Senior official affirmation.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bone-300">
          CMMC Level 2 requires an annual affirmation by a senior company official that the
          contractor continues to meet the certification requirements. Lapse = suspension of
          certificate.
        </p>
      </header>

      {/* Hero panel */}
      <section className="grid gap-6 border border-gold-300/40 bg-ink-900 p-6 shadow-gilt lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-gold-300">
            <ShieldCheck size={12} />
            NEXT AFFIRMATION
          </div>
          <div className="mt-4 flex items-baseline gap-4">
            <span className="font-serif text-7xl tracking-tightest text-bone-50">{dueIn}</span>
            <span className="font-mono text-sm text-bone-400">days</span>
          </div>
          <p className="mt-3 text-sm text-bone-200">
            Due <strong className="text-bone-50">{ORG.affirmationDue}</strong> · last affirmed{" "}
            <strong className="text-bone-50">{ORG.lastAffirmation}</strong>
          </p>
          <p className="mt-1 text-xs text-bone-400">
            Affirming official must be a senior company officer with authority to bind the
            organization.
          </p>

          <button className="mt-6 inline-flex items-center gap-2 bg-gold-300 px-5 py-3 text-xs font-medium text-ink-950 hover:bg-gold-200">
            <FileCheck2 size={14} /> Begin affirmation packet
          </button>
        </div>

        <aside className="border border-ink-700 bg-ink-950 p-5 self-start">
          <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
            CHECKLIST BEFORE FILING
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              "SPRS score reflects current posture",
              "All POA&Ms within 180-day window",
              "Senior official identified and authorized",
              "Annual review of SSP completed",
              "Continuous monitoring evidence captured"
            ].map((i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold-300 shrink-0" aria-hidden />
                <span className="text-bone-200">{i}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* History */}
      <section className="border border-ink-700 bg-ink-900">
        <header className="border-b border-ink-700 p-4 flex items-center gap-2">
          <Calendar size={14} className="text-bone-400" />
          <h2 className="font-serif text-lg text-bone-50">Affirmation history</h2>
        </header>
        <ul className="divide-y divide-ink-700">
          {HISTORY.map((h) => (
            <li key={h.cycle} className="grid gap-2 px-4 py-4 sm:grid-cols-[140px_140px_1fr_120px_120px]">
              <span className="font-mono text-xs text-gold-300">{h.cycle}</span>
              <span className="font-mono text-xs text-bone-400">{h.affirmedOn}</span>
              <span className="text-sm text-bone-100">{h.affirmer}</span>
              <span className="font-mono text-xs text-bone-300">SPRS {h.score}/110</span>
              <span
                className={`border px-2 py-0.5 font-mono text-[9px] tracking-widest2 justify-self-start ${
                  h.status === "Active"
                    ? "border-status-met/60 text-status-met"
                    : h.status === "Lapsed"
                    ? "border-status-na/60 text-status-na"
                    : "border-status-partial/60 text-status-partial"
                }`}
              >
                {h.status.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
