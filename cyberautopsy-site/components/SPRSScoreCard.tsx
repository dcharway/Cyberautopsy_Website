"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  score?: number; // -203..110
  target?: number; // pass threshold
  variant?: "post-remediation" | "pre-engagement";
};

export function SPRSScoreCard({ score = 110, target = 88, variant = "post-remediation" }: Props) {
  // Normalize for the dial: SPRS scoring range
  const min = -203;
  const max = 110;
  const pct = ((score - min) / (max - min)) * 100;
  const above = score >= target;

  return (
    <div className="relative w-full max-w-md border border-gold-300/40 bg-ink-900 p-7 shadow-gilt">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-widest2 text-gold-300">
          SPRS &middot; DoD SUPPLIER PERFORMANCE RISK SYSTEM
        </div>
        <div
          className={cn(
            "font-mono text-[10px] tracking-widest2 px-2 py-1 border",
            above ? "border-signal-green/60 text-signal-green" : "border-signal-red/60 text-signal-red"
          )}
        >
          {above ? "PASS" : "FAIL"}
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-bone-400">
            {variant === "post-remediation" ? "Post-Remediation Score" : "Self-Assessed Score"}
          </div>
          <div className="mt-2 font-serif text-7xl leading-none tracking-tightest text-bone-50">
            {score}
          </div>
          <div className="mt-1 text-xs text-bone-400">of 110 possible</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-widest text-bone-400">Threshold</div>
          <div className="mt-2 font-serif text-3xl text-gold-300">{target}</div>
          <div className="text-xs text-bone-400">CMMC 2.0 minimum</div>
        </div>
      </div>

      {/* Dial */}
      <div className="mt-7">
        <div className="relative h-2 bg-ink-700">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={cn("absolute left-0 top-0 h-full", above ? "bg-signal-green" : "bg-signal-red")}
          />
          <div
            className="absolute top-[-6px] h-5 w-px bg-gold-300"
            style={{ left: `${((target - min) / (max - min)) * 100}%` }}
            aria-hidden
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-bone-400">
          <span>-203</span>
          <span>0</span>
          <span>+110</span>
        </div>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-ink-700 pt-5 text-sm">
        <Row k="Controls met" v="103 / 110" />
        <Row k="POA&M (allowed)" v="7 of 7" />
        <Row k="Confidence" v="Audit-ready" />
        <Row k="Submitted" v="To DoD SPRS" />
      </dl>

      <div className="mt-6 text-xs text-bone-400">
        Sample posture from a $200M defense manufacturer engagement. Anonymized.
      </div>
    </div>
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
