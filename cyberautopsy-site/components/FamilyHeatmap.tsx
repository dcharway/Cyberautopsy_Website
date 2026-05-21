"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Status = "implemented" | "partial" | "missing";

type Family = {
  code: string;
  name: string;
  controls: number;
  // Sample posture distribution we render as a small multiples bar
  posture: { implemented: number; partial: number; missing: number };
};

const families: Family[] = [
  { code: "AC", name: "Access Control",                 controls: 22, posture: { implemented: 12, partial: 6, missing: 4 } },
  { code: "AT", name: "Awareness & Training",           controls: 3,  posture: { implemented: 2,  partial: 1, missing: 0 } },
  { code: "AU", name: "Audit & Accountability",         controls: 9,  posture: { implemented: 4,  partial: 3, missing: 2 } },
  { code: "CM", name: "Configuration Management",       controls: 9,  posture: { implemented: 3,  partial: 4, missing: 2 } },
  { code: "IA", name: "Identification & Authentication",controls: 11, posture: { implemented: 7,  partial: 3, missing: 1 } },
  { code: "IR", name: "Incident Response",              controls: 3,  posture: { implemented: 1,  partial: 1, missing: 1 } },
  { code: "MA", name: "Maintenance",                    controls: 6,  posture: { implemented: 3,  partial: 2, missing: 1 } },
  { code: "MP", name: "Media Protection",               controls: 9,  posture: { implemented: 4,  partial: 3, missing: 2 } },
  { code: "PS", name: "Personnel Security",             controls: 2,  posture: { implemented: 2,  partial: 0, missing: 0 } },
  { code: "PE", name: "Physical Protection",            controls: 6,  posture: { implemented: 4,  partial: 2, missing: 0 } },
  { code: "RA", name: "Risk Assessment",                controls: 3,  posture: { implemented: 1,  partial: 1, missing: 1 } },
  { code: "CA", name: "Security Assessment",            controls: 4,  posture: { implemented: 1,  partial: 2, missing: 1 } },
  { code: "SC", name: "System & Communications",        controls: 16, posture: { implemented: 6,  partial: 6, missing: 4 } },
  { code: "SI", name: "System & Information Integrity", controls: 7,  posture: { implemented: 3,  partial: 2, missing: 2 } }
];

function severity(f: Family): Status {
  const ratio = f.posture.implemented / f.controls;
  if (ratio >= 0.8) return "implemented";
  if (ratio >= 0.45) return "partial";
  return "missing";
}

const statusClass: Record<Status, string> = {
  implemented: "bg-signal-green/20 border-signal-green/50 text-signal-green",
  partial: "bg-signal-amber/20 border-signal-amber/50 text-signal-amber",
  missing: "bg-signal-red/20 border-signal-red/50 text-signal-red"
};

export function FamilyHeatmap() {
  const [active, setActive] = useState<Family | null>(null);
  const totals = useMemo(() => {
    return families.reduce(
      (acc, f) => {
        acc.implemented += f.posture.implemented;
        acc.partial += f.posture.partial;
        acc.missing += f.posture.missing;
        return acc;
      },
      { implemented: 0, partial: 0, missing: 0 }
    );
  }, []);
  const total = totals.implemented + totals.partial + totals.missing;

  return (
    <section className="relative bg-ink-900 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="classified-stamp">110 CONTROLS &middot; 14 FAMILIES</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              You have <span className="gold-text">14 families</span> to defend.
              <br />Three are usually failing.
            </h2>
            <p className="mt-5 text-bone-300 max-w-xl">
              This is the heatmap we produce in week two. Every cell is a defensible posture, not an
              opinion. Hover or tap a family to read the typical failure pattern.
            </p>
          </div>

          <Legend totals={totals} total={total} />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {families.map((f) => {
            const sev = severity(f);
            return (
              <button
                key={f.code}
                onMouseEnter={() => setActive(f)}
                onFocus={() => setActive(f)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  "group relative border bg-ink-800/40 p-4 text-left transition focus:outline-none",
                  statusClass[sev],
                  "hover:bg-ink-800"
                )}
                aria-label={`${f.name}, ${sev}, ${f.controls} controls`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] tracking-widest2">{f.code}</span>
                  <span className="font-serif text-2xl text-bone-50">{f.controls}</span>
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-widest text-bone-300">
                  {f.name}
                </div>
                <div className="mt-3 flex h-1.5 overflow-hidden">
                  <span
                    className="bg-signal-green"
                    style={{ width: `${(f.posture.implemented / f.controls) * 100}%` }}
                  />
                  <span
                    className="bg-signal-amber"
                    style={{ width: `${(f.posture.partial / f.controls) * 100}%` }}
                  />
                  <span
                    className="bg-signal-red"
                    style={{ width: `${(f.posture.missing / f.controls) * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div
          className="mt-10 min-h-[120px] border border-ink-700 bg-ink-950 p-6"
          aria-live="polite"
        >
          {active ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <div className="font-mono text-[11px] tracking-widest2 text-gold-300">
                  {active.code}
                </div>
                <div className="mt-1 font-serif text-2xl text-bone-50">{active.name}</div>
                <div className="mt-1 text-xs text-bone-400">{active.controls} controls in scope</div>
              </div>
              <div className="lg:col-span-2 text-sm text-bone-200">
                {failurePattern(active.code)}
              </div>
            </div>
          ) : (
            <p className="text-sm text-bone-400">
              Hover a family to read its typical failure pattern across DoD contractors we&rsquo;ve assessed.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Legend({ totals, total }: { totals: { implemented: number; partial: number; missing: number }; total: number }) {
  const pct = (n: number) => Math.round((n / total) * 100);
  return (
    <div className="grid grid-cols-3 gap-4 border border-ink-700 bg-ink-950 p-4 lg:min-w-[420px]">
      <LegendCell label="Implemented" value={totals.implemented} pct={pct(totals.implemented)} dot="bg-signal-green" />
      <LegendCell label="Partial" value={totals.partial} pct={pct(totals.partial)} dot="bg-signal-amber" />
      <LegendCell label="Missing" value={totals.missing} pct={pct(totals.missing)} dot="bg-signal-red" />
    </div>
  );
}

function LegendCell({ label, value, pct, dot }: { label: string; value: number; pct: number; dot: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", dot)} aria-hidden />
        <span className="text-[10px] uppercase tracking-widest text-bone-400">{label}</span>
      </div>
      <div className="mt-2 font-serif text-2xl text-bone-50">{value}</div>
      <div className="text-[11px] text-bone-400">{pct}% of 110</div>
    </div>
  );
}

function failurePattern(code: string): string {
  const m: Record<string, string> = {
    AC: "Privileged account separation, session lock timing, and remote access via VPN with MFA are the three sub-controls that most often fall to partial. Service accounts with stale entitlements are the audit headline.",
    AT: "Role-based training records exist but are not retained for the assessor’s 12-month review window. Insider threat training is frequently missed.",
    AU: "Logs exist but retention falls short of one year online and three years archived. Time synchronization to an authoritative source is rarely documented.",
    CM: "Baseline configurations are claimed but not version-controlled. Change tickets are not tied to a control owner.",
    IA: "Phishing-resistant MFA is the new bar. Hardware tokens or FIDO2 are required for privileged access in nearly every C3PAO finding we have read.",
    IR: "Incident playbooks exist but reporting times to DoD CYBER (DIBNet) are not pre-rehearsed. Tabletop logs are missing.",
    MA: "Maintenance personnel access controls and non-organizational maintenance tooling are not inventoried.",
    MP: "Removable media restrictions are usually written, rarely enforced at the endpoint. CUI marking on backups is the recurring gap.",
    PS: "Background screening evidence exists in HR but is not cross-walked to system access provisioning. This is fixable in a week.",
    PE: "Visitor logs and physical access for cleaning staff are routinely missed. Camera retention is uneven.",
    RA: "Risk assessments exist but are not refreshed on a defined cadence; vulnerability scanning frequency is the typical gap.",
    CA: "Continuous monitoring strategy is the missing artifact. Most contractors point to tools, not a strategy document.",
    SC: "Boundary protection diagrams and FIPS-validated cryptography assertions are the audit hot zone. Encryption-in-transit and at-rest evidence by data class is required.",
    SI: "Flaw remediation timelines and malicious code protection telemetry are inconsistently kept. Patch SLAs are not auditable."
  };
  return m[code] ?? "";
}
