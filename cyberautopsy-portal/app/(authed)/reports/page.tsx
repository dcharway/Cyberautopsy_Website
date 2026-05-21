import { Download, FileSpreadsheet, FileText, Package, BarChart3, type LucideIcon } from "lucide-react";

export const metadata = { title: "Reports · CyberAutopsy Portal" };

type Report = {
  code: string;
  icon: LucideIcon;
  title: string;
  description: string;
  formats: string[];
  badge: string;
  primary?: boolean;
  endpoint?: string;
  enabled: boolean;
};

const REPORTS: Report[] = [
  {
    code: "SSP-D",
    icon: FileSpreadsheet,
    title: "SSP Appendix D — Control Summary",
    description:
      "All 110 controls with current Implementation Status, weight, owner, evidence pointers, and POA&M references. Generated from live portal state.",
    formats: ["XLSX"],
    badge: "Audit-grade",
    endpoint: "/api/reports/ssp-appendix-d",
    enabled: true
  },
  {
    code: "POAM",
    icon: FileSpreadsheet,
    title: "POA&M Workbook",
    description:
      "DoD-style POA&M with risk, milestones, owner, status. Includes 180-day closure projections and CMMC 2.0 eligibility flags.",
    formats: ["XLSX"],
    badge: "DoD format",
    endpoint: "/api/reports/poam-workbook",
    enabled: true
  },
  {
    code: "EVD-MAP",
    icon: FileSpreadsheet,
    title: "Evidence Mapping Matrix",
    description:
      "Master artifact list keyed to controls + Assessment Objective letters per NIST 800-171A. Includes expiration tracking.",
    formats: ["XLSX"],
    badge: "C3PAO standard",
    endpoint: "/api/reports/evidence-matrix",
    enabled: true
  },
  {
    code: "SPRS",
    icon: BarChart3,
    title: "SPRS Score Export",
    description:
      "Computed score with deduction trail per control, weight, and unmet objective. Submission-ready JSON format.",
    formats: ["JSON"],
    badge: "Submission",
    endpoint: "/api/reports/sprs-export",
    enabled: true
  },
  {
    code: "EXEC",
    icon: FileText,
    title: "Executive Brief",
    description:
      "One-page exec summary: SPRS, controls met, top 5 risks, days to affirmation. Board-ready language. PDF generation in progress.",
    formats: ["PDF"],
    badge: "Coming next",
    enabled: false
  },
  {
    code: "PACKET",
    icon: Package,
    title: "C3PAO Assessment Packet",
    description:
      "Complete handoff: SSP Appendix D, POA&M, Evidence Mapping Matrix, SPRS Score, README, and manifest — bundled in a single zip generated from live state.",
    formats: ["ZIP"],
    badge: "One-click handoff",
    primary: true,
    endpoint: "/api/reports/c3pao-packet",
    enabled: true
  }
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">REPORTS &amp; EXPORTS</div>
        <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
          Every artifact, <span className="gold-text">on demand.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bone-300">
          Generated from the live portal state. Click <strong className="text-bone-100">Generate</strong> to download the
          audit-grade artifact directly — no staging, no copy-paste.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <article
              key={r.code}
              className={
                r.primary
                  ? "relative border border-gold-300/50 bg-ink-900 p-6 shadow-gilt"
                  : "border border-ink-700 bg-ink-900 p-6 hover:border-gold-300/40 transition"
              }
            >
              <header className="flex items-start gap-3">
                <span
                  className={
                    r.primary
                      ? "flex h-10 w-10 items-center justify-center border border-gold-300/60 bg-gold-300/10 text-gold-300"
                      : "flex h-10 w-10 items-center justify-center border border-ink-700 text-bone-300"
                  }
                >
                  <Icon size={18} />
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[10px] tracking-widest2 text-gold-300">{r.code}</span>
                    <span className="font-mono text-[9px] tracking-widest2 text-bone-400 border border-ink-700 px-1.5 py-0.5">
                      {r.badge.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="mt-2 font-serif text-xl text-bone-50">{r.title}</h2>
                </div>
              </header>

              <p className="mt-4 text-sm text-bone-300">{r.description}</p>

              <div className="mt-5 flex items-center justify-between border-t border-ink-700 pt-4">
                <div className="flex items-center gap-2">
                  {r.formats.map((f) => (
                    <span key={f} className="font-mono text-[10px] tracking-widest2 text-bone-400 border border-ink-700 px-2 py-1">
                      {f}
                    </span>
                  ))}
                </div>
                {r.enabled && r.endpoint ? (
                  <a
                    href={r.endpoint}
                    className={
                      r.primary
                        ? "inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200"
                        : "inline-flex items-center gap-2 border border-gold-300/40 bg-gold-300/5 px-4 py-2 text-xs text-gold-100 hover:bg-gold-300 hover:text-ink-950"
                    }
                  >
                    <Download size={13} /> Generate
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 border border-ink-700 px-4 py-2 text-xs text-bone-400">
                    <Download size={13} /> Coming next
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-xs text-bone-400">
        Exports are generated server-side at request time from the live portal state. Filenames
        follow <code className="font-mono text-bone-300">PREFIX_OrgSlug_YYYY-MM-DD.ext</code> per
        C3PAO conventions.
      </p>
    </div>
  );
}
