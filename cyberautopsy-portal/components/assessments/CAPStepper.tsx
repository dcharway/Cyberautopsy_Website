"use client";

import { useState } from "react";
import { Check, Circle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = {
  key: string;
  num: string;
  title: string;
  subtitle: string;
  status: "done" | "active" | "pending";
  startedAt?: string;
  completedAt?: string;
  artifactsDue: number;
  artifactsProvided: number;
  blockers: number;
  checklist: { item: string; done: boolean }[];
};

const PHASES: Phase[] = [
  {
    key: "readiness",
    num: "01",
    title: "Pre-Assessment Readiness",
    subtitle: "30 days before fieldwork. C3PAO confirms artifacts and scope.",
    status: "done",
    startedAt: "2026-03-15",
    completedAt: "2026-04-14",
    artifactsDue: 12,
    artifactsProvided: 12,
    blockers: 0,
    checklist: [
      { item: "System Security Plan (SSP), current version",                       done: true },
      { item: "SSP Appendix D — Control Summary",                                  done: true },
      { item: "POA&M, scrubbed against CMMC 2.0 weight rules",                     done: true },
      { item: "SPRS Score submission confirmation",                                done: true },
      { item: "Network diagram with CUI boundary (signed within 12 mo.)",          done: true },
      { item: "Asset inventory (hardware, software, firmware)",                    done: true },
      { item: "Data flow diagrams in/out of CUI boundary",                         done: true },
      { item: "Incident response plan",                                            done: true },
      { item: "Contingency plan with RTO/RPO",                                     done: true },
      { item: "User list + privilege matrix",                                      done: true },
      { item: "Prior-year affirmation (if recert)",                                done: true },
      { item: "Vendor/cloud shared responsibility matrix",                         done: true }
    ]
  },
  {
    key: "conformity",
    num: "02",
    title: "Conformity Assessment",
    subtitle: "C3PAO validates each control. 1-2 week fieldwork window.",
    status: "active",
    startedAt: "2026-05-05",
    artifactsDue: 110,
    artifactsProvided: 97,
    blockers: 3,
    checklist: [
      { item: "AC family evidence packet delivered",         done: true },
      { item: "AU family evidence packet delivered",         done: true },
      { item: "IA family evidence packet delivered (incl. MFA live demo)", done: true },
      { item: "CM family evidence packet delivered",         done: false },
      { item: "SC family — boundary + crypto walkthrough",   done: false },
      { item: "IR family — tabletop exercise rehearsal",     done: false }
    ]
  },
  {
    key: "reporting",
    num: "03",
    title: "Results Reporting",
    subtitle: "C3PAO drafts the assessment findings report and remediation requests.",
    status: "pending",
    artifactsDue: 4,
    artifactsProvided: 0,
    blockers: 0,
    checklist: [
      { item: "Draft Assessment Findings Report (AFR) reviewed",     done: false },
      { item: "Sponsor concurs with findings",                       done: false },
      { item: "Final AFR submitted to Cyber AB",                     done: false },
      { item: "Certificate issued or POA&M-closeout path defined",   done: false }
    ]
  },
  {
    key: "closeout",
    num: "04",
    title: "Certificate / POA&M Closeout",
    subtitle: "Certificate active. 180-day POA&M close-out clock begins.",
    status: "pending",
    artifactsDue: 8,
    artifactsProvided: 0,
    blockers: 0,
    checklist: [
      { item: "Certificate posted to SPRS + Cyber AB marketplace", done: false },
      { item: "POA&M items mapped to 180-day closure plan",        done: false },
      { item: "Annual affirmation calendar event scheduled",       done: false },
      { item: "Continuous monitoring cadence ratified",            done: false }
    ]
  }
];

export function CAPStepper() {
  const [activeKey, setActiveKey] = useState<string>(
    PHASES.find((p) => p.status === "active")?.key ?? "readiness"
  );
  const active = PHASES.find((p) => p.key === activeKey)!;

  return (
    <div className="space-y-6">
      {/* Stepper rail */}
      <ol className="grid gap-3 lg:grid-cols-4">
        {PHASES.map((p, i) => {
          const isActiveSelection = p.key === activeKey;
          return (
            <li key={p.key}>
              <button
                type="button"
                onClick={() => setActiveKey(p.key)}
                aria-current={isActiveSelection ? "step" : undefined}
                className={cn(
                  "group block w-full text-left border bg-ink-900 p-4 transition",
                  isActiveSelection
                    ? "border-gold-300/70 shadow-gilt"
                    : p.status === "done"
                    ? "border-status-met/40 hover:border-status-met"
                    : p.status === "active"
                    ? "border-status-review/60 hover:border-status-review"
                    : "border-ink-700 hover:border-bone-300"
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] tracking-widest2 text-gold-300">{p.num}</span>
                  <PhaseBadge status={p.status} />
                </div>
                <div className="mt-3 font-serif text-lg text-bone-50">{p.title}</div>
                <p className="mt-1 text-xs text-bone-400 line-clamp-2">{p.subtitle}</p>
                <div className="mt-3 flex h-1 overflow-hidden bg-ink-700">
                  <span
                    className={cn(
                      p.status === "done" ? "bg-status-met" : p.status === "active" ? "bg-status-review" : "bg-ink-600"
                    )}
                    style={{
                      width: `${
                        p.artifactsDue > 0 ? (p.artifactsProvided / p.artifactsDue) * 100 : 0
                      }%`
                    }}
                  />
                </div>
                <div className="mt-2 font-mono text-[10px] tracking-widest2 text-bone-400">
                  {p.artifactsProvided} / {p.artifactsDue} ARTIFACTS
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Detail */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Checklist */}
        <section className="border border-ink-700 bg-ink-900 p-6">
          <header className="flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
                PHASE {active.num} CHECKLIST
              </div>
              <h2 className="mt-1 font-serif text-2xl text-bone-50">{active.title}</h2>
            </div>
            <PhaseBadge status={active.status} />
          </header>

          <ul className="mt-5 divide-y divide-ink-700">
            {active.checklist.map((c, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center border",
                    c.done ? "border-status-met bg-status-metBg text-status-met" : "border-ink-700 text-bone-400"
                  )}
                  aria-hidden
                >
                  {c.done ? <Check size={12} /> : <Circle size={6} />}
                </span>
                <span className={cn("text-sm", c.done ? "text-bone-400 line-through" : "text-bone-100")}>
                  {c.item}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Side panel */}
        <aside className="space-y-4">
          <div className="border border-ink-700 bg-ink-900 p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
              Phase status
            </div>
            <dl className="mt-3 space-y-3 text-sm">
              <Row k="Started" v={active.startedAt ?? "—"} />
              <Row k="Completed" v={active.completedAt ?? "—"} />
              <Row k="Artifacts" v={`${active.artifactsProvided} / ${active.artifactsDue}`} />
              <Row
                k="Blockers"
                v={active.blockers === 0 ? "None" : `${active.blockers} active`}
                accent={active.blockers === 0 ? "text-status-met" : "text-status-failed"}
              />
            </dl>
          </div>

          {active.blockers > 0 && (
            <div className="border border-status-failed/60 bg-status-failedBg p-5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-status-failed">
                <AlertOctagon size={12} />
                Active blockers
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="border-l-2 border-status-failed pl-3">
                  CIS Benchmark scan results stale (3.4.1) — needs fresh export.
                </li>
                <li className="border-l-2 border-status-failed pl-3">
                  Insider threat training records missing (3.2.3).
                </li>
                <li className="border-l-2 border-status-failed pl-3">
                  Removable media policy not enforced at endpoint (3.8.7).
                </li>
              </ul>
            </div>
          )}

          <div className="border border-gold-300/40 bg-gold-300/5 p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
              Compliance Surgeon
            </div>
            <p className="mt-2 text-sm text-bone-100">M. Okafor</p>
            <p className="text-xs text-bone-400">Partner · Managing</p>
            <button className="mt-4 w-full border border-gold-300/40 bg-gold-300/10 px-3 py-2 text-xs text-gold-100 hover:bg-gold-300 hover:text-ink-950">
              Open war room →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PhaseBadge({ status }: { status: Phase["status"] }) {
  const styles =
    status === "done"
      ? "border-status-met/60 text-status-met"
      : status === "active"
      ? "border-status-review/60 text-status-review"
      : "border-ink-700 text-bone-400";
  const label = status === "done" ? "COMPLETE" : status === "active" ? "IN PROGRESS" : "PENDING";
  return (
    <span className={cn("border px-2 py-0.5 font-mono text-[9px] tracking-widest2", styles)}>
      {label}
    </span>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{k}</dt>
      <dd className={cn("text-bone-100", accent)}>{v}</dd>
    </div>
  );
}
