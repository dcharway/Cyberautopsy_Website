"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ANSWER_OPTIONS,
  type AnswerValue,
  type ContractHeader,
  type DeterminationResult,
  type FCISection,
  type SignatureBlock
} from "@/data/fci-determination";
import type { FCIState } from "@/lib/fci-store";

type Props = {
  assessmentId: string;
  clientName: string;
  reportingPeriod: string;
  sections: FCISection[];
  initialState: FCIState;
  initialDetermination: DeterminationResult;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const VERDICT_TONE: Record<DeterminationResult["verdict"], "ok" | "warn" | "bad" | "neutral"> = {
  none: "ok",
  fci_only: "warn",
  cui: "warn",
  enhanced_cui: "bad",
  indeterminate: "neutral"
};

const ANSWER_TONE_CLASS: Record<"ok" | "warn" | "bad" | "neutral", string> = {
  ok: "border-status-met/60 bg-status-metBg text-status-met",
  warn: "border-status-partial/60 bg-status-partialBg text-status-partial",
  bad: "border-status-failed/60 bg-status-failedBg text-status-failed",
  neutral: "border-ink-600 text-bone-400"
};

export function FCIWorkspace({
  assessmentId,
  clientName,
  reportingPeriod,
  sections,
  initialState,
  initialDetermination
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<FCIState>(initialState);
  const [det, setDet] = useState<DeterminationResult>(initialDetermination);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushSave = useCallback(
    async (patch: {
      header?: Partial<ContractHeader>;
      answers?: Record<string, AnswerValue>;
      rationaleNotes?: Record<string, string>;
      signatures?: Partial<SignatureBlock>;
    }) => {
      setSaveStatus("saving");
      setSaveError(null);
      try {
        const res = await fetch(`/api/admin/fci?assessmentId=${assessmentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Save failed");
        setState(data.state);
        setDet(data.determination);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 1600);
      } catch (err) {
        setSaveStatus("error");
        setSaveError(err instanceof Error ? err.message : "Save failed");
      }
    },
    [assessmentId]
  );

  function schedule(patch: Parameters<typeof flushSave>[0]) {
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void flushSave(patch), 450);
  }

  function setHeaderField<K extends keyof ContractHeader>(k: K, v: ContractHeader[K]) {
    setState((s) => ({ ...s, header: { ...s.header, [k]: v } }));
    schedule({ header: { [k]: v } as Partial<ContractHeader> });
  }
  function setAnswer(id: string, v: AnswerValue) {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: v } }));
    schedule({ answers: { [id]: v } });
  }
  function setNote(id: string, v: string) {
    setState((s) => ({ ...s, rationaleNotes: { ...s.rationaleNotes, [id]: v } }));
    schedule({ rationaleNotes: { [id]: v } });
  }
  function setSig<K extends keyof SignatureBlock>(k: K, v: SignatureBlock[K]) {
    setState((s) => ({ ...s, signatures: { ...s.signatures, [k]: v } }));
    schedule({ signatures: { [k]: v } as Partial<SignatureBlock> });
  }

  const verdictTone = VERDICT_TONE[det.verdict];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            FCI / CUI DETERMINATION
          </div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            Does this contract trigger CMMC?
          </h1>
          {clientName && (
            <p className="mt-2 text-xs text-bone-400">
              {clientName} · {reportingPeriod}
            </p>
          )}
        </div>
        <SaveIndicator status={saveStatus} error={saveError} />
      </header>

      {/* Verdict + export */}
      <section
        className={cn(
          "sticky top-16 z-20 border p-5 shadow-gilt",
          verdictTone === "ok"
            ? "border-status-met/60 bg-status-metBg"
            : verdictTone === "warn"
            ? "border-status-partial/60 bg-status-partialBg"
            : verdictTone === "bad"
            ? "border-status-failed/60 bg-status-failedBg"
            : "border-ink-700 bg-ink-900"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={22} className="mt-1" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
                DETERMINATION
              </div>
              <div className="mt-1 font-serif text-2xl text-bone-50">
                {det.headline}
              </div>
              <div className="mt-1 font-mono text-[11px] tracking-widest text-bone-300">
                RECOMMENDED CMMC LEVEL ·{" "}
                <span className="text-bone-50">{det.recommendedLevel === 0 ? "None" : `Level ${det.recommendedLevel}`}</span>
              </div>
            </div>
          </div>
          <a
            href={`/api/reports/fci-determination?assessmentId=${assessmentId}`}
            className="inline-flex items-center gap-2 border border-gold-300/50 bg-gold-300/10 px-4 py-2.5 text-xs font-medium text-gold-100 hover:bg-gold-300 hover:text-ink-950"
          >
            <Download size={13} /> Download determination PDF
          </a>
        </div>
      </section>

      {/* Rationale */}
      {det.rationale && (
        <section className="border border-ink-700 bg-ink-900 p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">RATIONALE</div>
          <p className="mt-2 text-sm text-bone-200 leading-relaxed">{det.rationale}</p>
        </section>
      )}

      {/* Contract identification */}
      <section className="border border-ink-700 bg-ink-900 p-6">
        <SectionTitle number="A" title="Contract identification" description="The contract this determination applies to." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <FieldInput label="Contract / task order #" value={state.header.contractNumber} onChange={(v) => setHeaderField("contractNumber", v)} />
          <FieldInput label="Contracting agency"      value={state.header.contractingAgency} onChange={(v) => setHeaderField("contractingAgency", v)} />
          <FieldInput label="Contract type"           value={state.header.contractType} onChange={(v) => setHeaderField("contractType", v)} placeholder="FFP / T&M / IDIQ" />
          <FieldInput label="Period of performance"   value={state.header.periodOfPerformance} onChange={(v) => setHeaderField("periodOfPerformance", v)} placeholder="2026-03-15 → 2028-03-14" />
          <FieldSelect
            label="Prime or sub"
            value={state.header.primeOrSub}
            onChange={(v) => setHeaderField("primeOrSub", v as ContractHeader["primeOrSub"])}
            options={[
              { value: "", label: "— select —" },
              { value: "prime", label: "Prime" },
              { value: "sub", label: "Subcontract" }
            ]}
          />
          <FieldInput label="Prime contractor (if sub)" value={state.header.primeContractor} onChange={(v) => setHeaderField("primeContractor", v)} />
          <FieldTextarea label="Contract description" value={state.header.contractDescription} onChange={(v) => setHeaderField("contractDescription", v)} rows={3} full />
        </div>
      </section>

      {/* Questionnaire sections */}
      {sections.filter((s) => s.items.length > 0).map((section) => (
        <section key={section.id} className="border border-ink-700 bg-ink-900">
          <header className="border-b border-ink-700 px-6 py-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
              SECTION {section.number}
            </div>
            <h2 className="mt-1 font-serif text-2xl text-bone-50">{section.title}</h2>
            <p className="mt-2 text-xs text-bone-400 leading-relaxed">{section.description}</p>
          </header>
          <div className="divide-y divide-ink-700/60">
            {section.items.map((q) => {
              const answer = state.answers[q.id] ?? null;
              return (
                <article key={q.id} className="grid gap-4 px-6 py-5 lg:grid-cols-12">
                  <div className="lg:col-span-6">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] tracking-widest2 text-gold-300">{q.number}</span>
                      {q.polarity === "negative" && (
                        <span
                          title="Counter-indicator — Yes here argues AGAINST the determination"
                          className="border border-ink-700 px-1 py-0.5 font-mono text-[9px] tracking-widest text-bone-400"
                        >
                          COUNTER-INDICATOR
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-bone-100">{q.prompt}</p>
                    {q.hint && (
                      <p className="mt-2 flex items-start gap-1.5 text-[11px] italic text-bone-400">
                        <Info size={11} className="mt-0.5 shrink-0 text-gold-300" /> {q.hint}
                      </p>
                    )}
                    {q.reference && (
                      <p className="mt-2 font-mono text-[10px] tracking-widest text-bone-500">
                        REF · {q.reference}
                      </p>
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {ANSWER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAnswer(q.id, opt.value)}
                          className={cn(
                            "border px-2.5 py-1 font-mono text-[10px] tracking-widest2 transition",
                            answer === opt.value
                              ? ANSWER_TONE_CLASS[opt.tone]
                              : "border-ink-700 text-bone-400 hover:border-bone-300 hover:text-bone-100"
                          )}
                        >
                          {opt.label.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-4">
                    <textarea
                      value={state.rationaleNotes[q.id] ?? ""}
                      onChange={(e) => setNote(q.id, e.target.value)}
                      rows={2}
                      placeholder="Rationale / supporting evidence…"
                      className="w-full border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {/* Signatures */}
      <section className="border border-ink-700 bg-ink-900 p-6">
        <SectionTitle number="E" title="Sign-off" description="Prepared-by + approved-by fields printed on the PDF export." />
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">PREPARED BY</div>
            <div className="mt-3 grid gap-3">
              <FieldInput label="Name" value={state.signatures.preparedByName} onChange={(v) => setSig("preparedByName", v)} />
              <FieldInput label="Title" value={state.signatures.preparedByTitle} onChange={(v) => setSig("preparedByTitle", v)} />
              <FieldInput label="Date" type="date" value={state.signatures.preparedByDate} onChange={(v) => setSig("preparedByDate", v)} />
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">APPROVED BY</div>
            <div className="mt-3 grid gap-3">
              <FieldInput label="Name" value={state.signatures.approvedByName} onChange={(v) => setSig("approvedByName", v)} />
              <FieldInput label="Title" value={state.signatures.approvedByTitle} onChange={(v) => setSig("approvedByTitle", v)} />
              <FieldInput label="Date" type="date" value={state.signatures.approvedByDate} onChange={(v) => setSig("approvedByDate", v)} />
            </div>
          </div>
        </div>
      </section>

      {/* Section summary panel */}
      <section className="border border-ink-700 bg-ink-950 p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">SECTION SUMMARY</div>
        <div className="mt-3 grid gap-2">
          {det.bySection.map((r) => (
            <div
              key={r.section.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-ink-700 bg-ink-900 px-4 py-3"
            >
              <div>
                <div className="text-sm text-bone-100">
                  {r.section.number}. {r.section.title}
                </div>
                <div className="font-mono text-[10px] tracking-widest text-bone-400">
                  Answered {r.answered}/{r.total} · {r.positiveYes} positive Yes ·{" "}
                  {r.negativeYes} counter-indicator Yes
                </div>
              </div>
              <StatusChip positive={r.positiveYes} answered={r.answered} total={r.total} />
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-bone-400">
        Every answer, note, and signature autosaves. Downloading the PDF triggers a fresh render of
        the current record — no manual save required first.
      </p>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function SaveIndicator({ status, error }: { status: SaveStatus; error: string | null }) {
  if (status === "saving") return <Chip><Save size={11} /> SAVING…</Chip>;
  if (status === "saved") return <Chip className="text-status-met"><CheckCircle2 size={11} /> SAVED</Chip>;
  if (status === "error") return <Chip className="text-status-failed" title={error ?? undefined}><AlertCircle size={11} /> {error ?? "ERROR"}</Chip>;
  return <span className="font-mono text-[10px] tracking-widest text-bone-500">AUTOSAVE ENABLED</span>;
}

function Chip({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-bone-400", className)} title={title}>
      {children}
    </span>
  );
}

function SectionTitle({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <header>
      <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">SECTION {number}</div>
      <h2 className="mt-1 font-serif text-xl text-bone-50">{title}</h2>
      <p className="mt-1 text-xs text-bone-400">{description}</p>
    </header>
  );
}

function StatusChip({ positive, answered, total }: { positive: number; answered: number; total: number }) {
  const tone: "ok" | "warn" | "neutral" =
    answered === 0 ? "neutral" : positive > 0 ? "warn" : "ok";
  const label = answered === 0 ? "NOT ANSWERED" : positive > 0 ? `${positive} × YES` : "ALL CLEAR";
  return (
    <span
      className={cn(
        "border px-2 py-0.5 font-mono text-[10px] tracking-widest2",
        tone === "ok" && "border-status-met/60 text-status-met",
        tone === "warn" && "border-status-partial/60 text-status-partial",
        tone === "neutral" && "border-ink-600 text-bone-400"
      )}
    >
      {label}
      <span className="ml-2 opacity-60">
        ({answered}/{total})
      </span>
    </span>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "date";
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-bone-400">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
      />
    </label>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
  rows = 3,
  full = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  full?: boolean;
}) {
  return (
    <label className={full ? "block sm:col-span-2" : "block"}>
      <span className="text-[11px] uppercase tracking-widest text-bone-400">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
      />
    </label>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-bone-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-bone-100 focus:border-gold-300 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
