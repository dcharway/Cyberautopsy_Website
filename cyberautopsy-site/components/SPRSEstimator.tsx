"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * SPRS Score Estimator
 *
 * Approximates a NIST SP 800-171 self-assessment score across 10 posture
 * questions. Each question bundles real 800-171 controls and applies the
 * standard SPRS weights (1 / 3 / 5) when the posture is not fully implemented.
 *
 * The numbers in `questions[].maxDeduction` are calculated from the underlying
 * control weights; partial implementation costs half the full deduction.
 *
 * This is an estimator, not a substitute for a Gap Assessment. The model is
 * intentionally conservative; real SPRS results require the full 110-control
 * evaluation against NIST 800-171A determination statements.
 */

type Posture = "implemented" | "partial" | "missing" | null;

type Question = {
  id: string;
  prompt: string;
  detail: string;
  controls: string;
  maxDeduction: number; // SPRS weight sum if not implemented
};

const QUESTIONS: Question[] = [
  {
    id: "mfa",
    prompt: "Phishing-resistant MFA on privileged accounts and remote access",
    detail:
      "Hardware tokens or FIDO2 for administrators and any access originating outside the trusted boundary.",
    controls: "3.5.3, 3.7.5",
    maxDeduction: 10
  },
  {
    id: "crypto",
    prompt: "FIPS-validated cryptography for CUI at rest and in transit",
    detail:
      "FIPS 140-2 / 140-3 validated modules everywhere CUI is encrypted. Bring-your-own-encryption does not qualify.",
    controls: "3.13.8, 3.13.11",
    maxDeduction: 10
  },
  {
    id: "boundary",
    prompt: "Network boundary protection: firewall, DMZ, and monitored egress",
    detail:
      "A documented, diagrammed boundary with proxied egress and explicit deny-by-default rules. Cloud equivalents count.",
    controls: "3.13.1, 3.13.5, 3.13.6",
    maxDeduction: 11
  },
  {
    id: "audit",
    prompt: "Audit log generation, 1+ year retention, and weekly review",
    detail:
      "Logs from CUI systems, retained one year online and three years archived, with documented periodic review.",
    controls: "3.3.1, 3.3.2, 3.3.4, 3.3.5",
    maxDeduction: 12
  },
  {
    id: "vuln",
    prompt: "Vulnerability scanning monthly + patch SLA enforced",
    detail:
      "Authenticated scans, critical vulnerabilities remediated within a defined and tracked SLA.",
    controls: "3.11.2, 3.11.3, 3.14.1",
    maxDeduction: 9
  },
  {
    id: "ir",
    prompt: "Incident response plan, tested, reportable to DoD within 72 hours",
    detail:
      "A named DIBNet submitter, a tabletop exercised within 12 months, and a tested 72-hour reporting path.",
    controls: "3.6.1, 3.6.2, 3.6.3",
    maxDeduction: 11
  },
  {
    id: "config",
    prompt: "Configuration baselines + change control + inventory",
    detail:
      "Version-controlled baselines per system class, change tickets per modification, current asset inventory.",
    controls: "3.4.1, 3.4.2, 3.4.3, 3.4.4",
    maxDeduction: 10
  },
  {
    id: "iam",
    prompt: "Least privilege, separation of duties, session lock",
    detail:
      "Reviewed entitlement assignments, separated duties for privileged actions, automated session lock under 15 minutes.",
    controls: "3.1.5, 3.1.7, 3.1.10",
    maxDeduction: 7
  },
  {
    id: "cui",
    prompt: "CUI marking and media protection",
    detail:
      "CUI banners applied consistently, removable media controlled at the endpoint, sanitization documented.",
    controls: "3.8.1, 3.8.3, 3.8.5",
    maxDeduction: 6
  },
  {
    id: "training",
    prompt: "Annual security awareness, role-based training, background screening",
    detail:
      "Training records retained 12+ months, role-based content for privileged users, screening evidence linked to access.",
    controls: "3.2.1, 3.2.2, 3.2.3, 3.9.1",
    maxDeduction: 4
  }
];

const MAX_TOTAL_DEDUCTION = QUESTIONS.reduce((s, q) => s + q.maxDeduction, 0); // 90
const STARTING_SCORE = 110;
const PASS_THRESHOLD = 88;

const POSTURE_LABEL: Record<Exclude<Posture, null>, string> = {
  implemented: "Fully implemented",
  partial: "Partially implemented",
  missing: "Not implemented"
};

function deduction(posture: Posture, max: number) {
  if (posture === "missing") return max;
  if (posture === "partial") return Math.round(max / 2);
  return 0;
}

export function SPRSEstimator() {
  const [answers, setAnswers] = useState<Record<string, Posture>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, null]))
  );

  const answeredCount = Object.values(answers).filter((v) => v !== null).length;

  const result = useMemo(() => {
    const totalDeduction = QUESTIONS.reduce(
      (sum, q) => sum + deduction(answers[q.id], q.maxDeduction),
      0
    );
    const score = STARTING_SCORE - totalDeduction;
    const pass = score >= PASS_THRESHOLD;
    const points = Math.max(0, PASS_THRESHOLD - score);

    const breakdown = QUESTIONS.map((q) => ({
      question: q,
      posture: answers[q.id],
      lost: deduction(answers[q.id], q.maxDeduction)
    }));

    return { score, pass, points, breakdown, totalDeduction };
  }, [answers]);

  const allAnswered = answeredCount === QUESTIONS.length;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      {/* QUESTIONS */}
      <div>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-bone-50">The 10 questions</h2>
          <div className="font-mono text-[11px] tracking-widest2 text-bone-400">
            {answeredCount} / {QUESTIONS.length} ANSWERED
          </div>
        </div>

        <ol className="space-y-4">
          {QUESTIONS.map((q, i) => (
            <li
              key={q.id}
              className={cn(
                "border bg-ink-900 p-6 transition",
                answers[q.id] ? "border-gold-300/40" : "border-ink-700"
              )}
            >
              <div className="flex items-baseline justify-between gap-4">
                <div className="font-mono text-[11px] tracking-widest2 text-gold-300">
                  Q{String(i + 1).padStart(2, "0")} &middot; NIST {q.controls}
                </div>
                <div className="font-mono text-[10px] tracking-widest2 text-bone-400">
                  &minus;{q.maxDeduction} pts max
                </div>
              </div>
              <h3 className="mt-3 font-serif text-xl text-bone-50">{q.prompt}</h3>
              <p className="mt-2 text-sm text-bone-300">{q.detail}</p>

              <div
                role="radiogroup"
                aria-label={q.prompt}
                className="mt-5 grid gap-2 sm:grid-cols-3"
              >
                {(["implemented", "partial", "missing"] as const).map((posture) => {
                  const selected = answers[q.id] === posture;
                  return (
                    <button
                      key={posture}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: posture }))}
                      className={cn(
                        "border px-3 py-2.5 text-sm transition text-left",
                        selected
                          ? posture === "implemented"
                            ? "border-signal-green/70 bg-signal-green/15 text-bone-50"
                            : posture === "partial"
                            ? "border-signal-amber/70 bg-signal-amber/15 text-bone-50"
                            : "border-signal-red/70 bg-signal-red/15 text-bone-50"
                          : "border-ink-700 text-bone-300 hover:border-bone-300"
                      )}
                    >
                      <span className="font-mono text-[10px] tracking-widest2 text-bone-400">
                        {posture === "implemented" ? "IMPL." : posture === "partial" ? "PARTIAL" : "MISSING"}
                      </span>
                      <span className="mt-1 block">{POSTURE_LABEL[posture]}</span>
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* SCORE PANEL */}
      <aside>
        <div className="sticky top-28">
          <div
            className={cn(
              "border bg-ink-900 p-7 shadow-gilt",
              allAnswered && result.pass
                ? "border-signal-green/60"
                : allAnswered
                ? "border-signal-red/60"
                : "border-gold-300/40"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] tracking-widest2 text-gold-300">
                ESTIMATED SPRS SCORE
              </div>
              {allAnswered && (
                <div
                  className={cn(
                    "font-mono text-[10px] tracking-widest2 px-2 py-1 border",
                    result.pass
                      ? "border-signal-green/60 text-signal-green"
                      : "border-signal-red/60 text-signal-red"
                  )}
                >
                  {result.pass ? "PASS" : "FAIL"}
                </div>
              )}
            </div>

            <motion.div
              key={result.score}
              initial={{ opacity: 0.5, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5 font-serif text-7xl leading-none tracking-tightest text-bone-50"
            >
              {result.score}
            </motion.div>
            <div className="mt-1 text-xs text-bone-400">
              of 110 possible &middot; {PASS_THRESHOLD} required for certification
            </div>

            {/* Dial */}
            <div className="mt-6 relative h-2 bg-ink-700">
              <motion.div
                animate={{ width: `${Math.max(0, Math.min(100, ((result.score - 20) / 90) * 100))}%` }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "absolute left-0 top-0 h-full",
                  result.pass ? "bg-signal-green" : "bg-signal-red"
                )}
              />
              <div
                className="absolute top-[-6px] h-5 w-px bg-gold-300"
                style={{ left: `${((PASS_THRESHOLD - 20) / 90) * 100}%` }}
                aria-hidden
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-bone-400">
              <span>20</span>
              <span>88</span>
              <span>110</span>
            </div>

            {/* Verdict */}
            <div className="mt-7 border-t border-ink-700 pt-5 text-sm text-bone-200">
              {!allAnswered && (
                <p className="text-bone-300">
                  Answer all {QUESTIONS.length} questions for an estimate. The score updates as you go.
                </p>
              )}
              {allAnswered && result.pass && (
                <p>
                  Your posture as self-reported clears the CMMC 2.0 minimum of {PASS_THRESHOLD}. That
                  is the floor &mdash; not a passing grade. The remaining gap to 110 (&minus;{result.totalDeduction})
                  becomes your POA&amp;M, which must close within 180 days. Audit-ready posture is
                  defined by artifact, not self-report.
                </p>
              )}
              {allAnswered && !result.pass && (
                <p>
                  Your self-reported posture sits {result.points} point{result.points === 1 ? "" : "s"} below the CMMC 2.0
                  minimum. At this level no POA&amp;M is permitted &mdash; remediation must close the gap
                  before certification can be pursued. A Gap Assessment will confirm whether the
                  shortfall is concentrated in POA&amp;M-eligible controls or in weight-5 controls
                  that cannot be POA&amp;M&apos;d at all.
                </p>
              )}
            </div>

            <Link
              href="/contact"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200"
            >
              Send this score to a partner &rarr;
            </Link>
            <p className="mt-3 text-[11px] text-bone-400">
              We use the answers to scope a 15-minute triage call. No marketing list.
            </p>
          </div>

          {/* Breakdown */}
          {answeredCount > 0 && (
            <div className="mt-6 border border-ink-700 bg-ink-900 p-6">
              <div className="font-mono text-[10px] tracking-widest2 text-bone-400">
                WHERE POINTS ARE LOST
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {result.breakdown
                  .filter((b) => b.lost > 0)
                  .sort((a, b) => b.lost - a.lost)
                  .map((b) => (
                    <li key={b.question.id} className="flex items-baseline justify-between gap-3">
                      <span className="text-bone-200">{b.question.prompt}</span>
                      <span className="font-mono text-xs text-signal-red shrink-0">
                        &minus;{b.lost}
                      </span>
                    </li>
                  ))}
                {result.breakdown.filter((b) => b.lost > 0).length === 0 && (
                  <li className="text-bone-400 text-sm">
                    No deductions yet. Mark partial or missing to see the impact.
                  </li>
                )}
              </ul>
              <div className="mt-4 border-t border-ink-700 pt-4 flex justify-between font-mono text-xs">
                <span className="text-bone-400">Total deduction</span>
                <span className="text-signal-red">&minus;{result.totalDeduction}</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export const SPRS_META = {
  total: MAX_TOTAL_DEDUCTION,
  starting: STARTING_SCORE,
  threshold: PASS_THRESHOLD,
  questionCount: QUESTIONS.length
};
