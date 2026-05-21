import Link from "next/link";
import { ChevronRight, Clock, CheckCircle2 } from "lucide-react";

type Request = {
  id: string;
  artifact: string;
  control: string;
  due: string;
  status: "outstanding" | "submitted" | "due-soon";
};

const REQUESTS: Request[] = [
  { id: "REQ-1.3", artifact: "Updated POA&M with CMMC 2.0 weights",        control: "ALL",     due: "Tomorrow",        status: "due-soon" },
  { id: "REQ-2.4", artifact: "SIEM Audit Policy + 7-day log sample",       control: "3.3.1",   due: "May 18, 2026",    status: "outstanding" },
  { id: "REQ-2.7", artifact: "Removable media inventory + policy",         control: "3.8.7",   due: "May 20, 2026",    status: "outstanding" },
  { id: "REQ-2.9", artifact: "CIS Benchmark scan results, 10% sample",     control: "3.4.1",   due: "May 22, 2026",    status: "outstanding" },
  { id: "REQ-1.5", artifact: "Network diagram with CUI boundary, signed",  control: "3.13.1",  due: "May 14, 2026",    status: "submitted" }
];

const STATUS_STYLE: Record<Request["status"], string> = {
  outstanding: "border-status-partial/60 text-status-partial",
  "due-soon":  "border-status-failed/60 text-status-failed",
  submitted:   "border-status-met/60 text-status-met"
};

const STATUS_LABEL: Record<Request["status"], string> = {
  outstanding: "OUTSTANDING",
  "due-soon": "DUE TOMORROW",
  submitted: "SUBMITTED"
};

export function AssessorRequests() {
  return (
    <section className="border border-ink-700 bg-ink-900 p-5">
      <header className="flex items-baseline justify-between">
        <div>
          <h2 className="font-serif text-lg text-bone-50">C3PAO requests</h2>
          <p className="text-xs text-bone-400">
            From Veritas Cyber Assessors · Phase 2 (Conformity)
          </p>
        </div>
        <Link href="/assessments" className="font-mono text-[11px] tracking-widest2 text-gold-300 hover:text-gold-100">
          VIEW QUEUE →
        </Link>
      </header>

      <ul className="mt-4 divide-y divide-ink-700">
        {REQUESTS.map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-3">
            <div className="shrink-0">
              {r.status === "submitted" ? (
                <CheckCircle2 size={16} className="text-status-met" />
              ) : (
                <Clock size={16} className={r.status === "due-soon" ? "text-status-failed" : "text-status-partial"} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 truncate">
                <span className="font-mono text-[10px] tracking-widest2 text-bone-400">{r.id}</span>
                <span className="text-sm text-bone-100 truncate">{r.artifact}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-3 font-mono text-[10px] text-bone-400">
                <span>CONTROL · {r.control}</span>
                <span>DUE · {r.due}</span>
              </div>
            </div>
            <span className={`shrink-0 border px-2 py-0.5 font-mono text-[9px] tracking-widest2 ${STATUS_STYLE[r.status]}`}>
              {STATUS_LABEL[r.status]}
            </span>
            <ChevronRight size={14} className="hidden text-bone-400 lg:block" />
          </li>
        ))}
      </ul>
    </section>
  );
}
