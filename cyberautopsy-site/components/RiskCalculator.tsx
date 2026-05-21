"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function RiskCalculator() {
  const [contractValue, setContractValue] = useState(8_000_000);
  const [years, setYears] = useState(3);
  const [pipeline, setPipeline] = useState(2);
  const [cuiTouching, setCuiTouching] = useState(true);
  const [cageCode, setCageCode] = useState("");

  const result = useMemo(() => {
    // Loss-aversion math: annualized + opportunity pipeline + cost of late audit
    const annualValue = contractValue / Math.max(1, years);
    const opportunityLoss = annualValue * pipeline;
    const directLoss = contractValue;
    const reaudit = 145_000; // emergency C3PAO + remediation surge
    const ineligibilityFactor = cuiTouching ? 1 : 0.6;
    const total = (directLoss + opportunityLoss + reaudit) * ineligibilityFactor;
    return {
      total,
      breakdown: {
        directLoss: directLoss * ineligibilityFactor,
        opportunityLoss: opportunityLoss * ineligibilityFactor,
        reaudit
      }
    };
  }, [contractValue, years, pipeline, cuiTouching]);

  return (
    <section
      id="risk-calculator"
      className="relative bg-ink-950 py-24 lg:py-32 border-t border-ink-700/70"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="classified-stamp">CONTRACT RISK CALCULATOR</span>
          <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
            How much contract value <span className="gold-text">is on the line?</span>
          </h2>
          <p className="mt-5 text-bone-300">
            A blunt estimate of dollars at risk if your CMMC posture costs you eligibility for the
            next solicitation. Numbers are illustrative; the audit packet is the real answer.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="border border-ink-700 bg-ink-900 p-8">
            <div className="grid gap-6">
              <Field label="Largest active DoD contract (USD)">
                <NumberInput value={contractValue} onChange={setContractValue} step={100_000} min={100_000} />
              </Field>
              <Field label="Contract length (years)">
                <Range value={years} onChange={setYears} min={1} max={10} />
                <Hint>{years} year{years > 1 ? "s" : ""}</Hint>
              </Field>
              <Field label="Pipeline awards likely lost in 24 months">
                <Range value={pipeline} onChange={setPipeline} min={0} max={6} />
                <Hint>{pipeline} award{pipeline === 1 ? "" : "s"}</Hint>
              </Field>
              <Field label="Do you handle CUI today?">
                <div className="mt-1 flex gap-3">
                  <Toggle on={cuiTouching} onClick={() => setCuiTouching(true)}>Yes</Toggle>
                  <Toggle on={!cuiTouching} onClick={() => setCuiTouching(false)}>No / Unsure</Toggle>
                </div>
              </Field>
              <Field label="CAGE code (optional)">
                <input
                  value={cageCode}
                  onChange={(e) => setCageCode(e.target.value.toUpperCase().slice(0, 5))}
                  placeholder="e.g. 1A2B3"
                  className="mt-1 w-full border border-ink-700 bg-ink-950 px-3 py-2 font-mono text-sm text-bone-100 placeholder:text-bone-400 focus:border-gold-300"
                />
              </Field>
            </div>
          </div>

          <div className="border border-gold-300/40 bg-gradient-to-br from-ink-900 to-ink-950 p-8 shadow-gilt">
            <div className="font-mono text-[10px] tracking-widest2 text-gold-300">
              ESTIMATED EXPOSURE
            </div>
            <motion.div
              key={Math.round(result.total)}
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-4 font-serif text-6xl tracking-tightest text-bone-50 lg:text-7xl"
            >
              {formatUSD(result.total)}
            </motion.div>
            <p className="mt-3 text-bone-300">
              The figure assumes loss of the active contract plus expected awards in the next 24
              months if you remain ineligible to bid on CUI-bearing work.
            </p>

            <dl className="mt-8 space-y-3 border-t border-ink-700 pt-6 text-sm">
              <Row k="Direct contract loss" v={formatUSD(result.breakdown.directLoss)} />
              <Row k="Pipeline opportunity loss" v={formatUSD(result.breakdown.opportunityLoss)} />
              <Row k="Emergency re-audit and surge" v={formatUSD(result.breakdown.reaudit)} />
            </dl>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center justify-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200"
            >
              Send this to a Compliance Surgeon
              <span aria-hidden>&rarr;</span>
            </Link>
            <p className="mt-3 text-[11px] text-bone-400">
              We&rsquo;ll route this to the founder for a 15-minute triage call. No spam list, no automation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-widest text-bone-400">{label}</div>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  step,
  min
}: {
  value: number;
  onChange: (n: number) => void;
  step: number;
  min: number;
}) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      min={min}
      onChange={(e) => onChange(Number(e.target.value || 0))}
      className="mt-2 w-full border border-ink-700 bg-ink-950 px-3 py-3 font-mono text-lg text-bone-100 focus:border-gold-300"
    />
  );
}

function Range({
  value,
  onChange,
  min,
  max
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className="mt-3 w-full accent-gold-300"
    />
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 font-mono text-xs text-bone-300">{children}</div>;
}

function Toggle({
  on,
  onClick,
  children
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm border transition",
        on ? "border-gold-300 bg-gold-300/10 text-gold-100" : "border-ink-700 text-bone-300 hover:border-bone-300"
      )}
    >
      {children}
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[11px] uppercase tracking-widest text-bone-400">{k}</dt>
      <dd className="font-mono text-sm text-bone-100">{v}</dd>
    </div>
  );
}

function formatUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}
