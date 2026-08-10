"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  Tag,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ANSWER_OPTIONS,
  type AnswerValue,
  type CUICategory,
  type CUISection,
  type DeterminationResult,
  type InfoAssetHeader,
  type SignatureBlock
} from "@/data/cui-determination";
import type { CUIState } from "@/lib/cui-store";

type Props = {
  assessmentId: string;
  clientName: string;
  reportingPeriod: string;
  sections: CUISection[];
  categories: CUICategory[];
  initialState: CUIState;
  initialDetermination: DeterminationResult;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const VERDICT_TONE: Record<DeterminationResult["verdict"], "ok" | "warn" | "bad" | "neutral"> = {
  not_cui: "ok",
  cui_basic: "warn",
  cui_specified: "warn",
  enhanced_cui: "bad",
  indeterminate: "neutral"
};

const ANSWER_TONE_CLASS: Record<"ok" | "warn" | "bad" | "neutral", string> = {
  ok: "border-status-met/60 bg-status-metBg text-status-met",
  warn: "border-status-partial/60 bg-status-partialBg text-status-partial",
  bad: "border-status-failed/60 bg-status-failedBg text-status-failed",
  neutral: "border-ink-600 text-bone-400"
};

const VERDICT_LABEL: Record<DeterminationResult["verdict"], string> = {
  not_cui: "NOT CUI",
  cui_basic: "CUI BASIC",
  cui_specified: "CUI SPECIFIED",
  enhanced_cui: "ENHANCED CUI (LEVEL 3)",
  indeterminate: "INDETERMINATE"
};

export function CUIWorkspace({
  assessmentId,
  clientName,
  reportingPeriod,
  sections,
  categories,
  initialState,
  initialDetermination
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<CUIState>(initialState);
  const [det, setDet] = useState<DeterminationResult>(initialDetermination);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushSave = useCallback(
    async (patch: {
      assetHeader?: Partial<InfoAssetHeader>;
      answers?: Record<string, AnswerValue>;
      rationaleNotes?: Record<string, string>;
      selectedCategoryCodes?: string[];
      categoryOtherNote?: string;
      signatures?: Partial<SignatureBlock>;
    }) => {
      setSaveStatus("saving");
      setSaveError(null);
      try {
        const res = await fetch(`/api/admin/cui?assessmentId=${assessmentId}`, {
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

  function setHeaderField<K extends keyof InfoAssetHeader>(k: K, v: InfoAssetHeader[K]) {
    setState((s) => ({ ...s, assetHeader: { ...s.assetHeader, [k]: v } }));
    schedule({ assetHeader: { [k]: v } as Partial<InfoAssetHeader> });
  }
  function setAnswer(id: string, v: AnswerValue) {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: v } }));
    schedule({ answers: { [id]: v } });
  }
  function setNote(id: string, v: string) {
    setState((s) => ({ ...s, rationaleNotes: { ...s.rationaleNotes, [id]: v } }));
    schedule({ rationaleNotes: { [id]: v } });
  }
  function toggleCategory(code: string) {
    setState((s) => {
      const has = s.selectedCategoryCodes.includes(code);
      const next = has
        ? s.selectedCategoryCodes.filter((c) => c !== code)
        : [...s.selectedCategoryCodes, code];
      // fire save immediately so the determination reflects it now
      void flushSave({ selectedCategoryCodes: next });
      return { ...s, selectedCategoryCodes: next };
    });
  }
  function setCategoryOther(v: string) {
    setState((s) => ({ ...s, categoryOtherNote: v }));
    schedule({ categoryOtherNote: v });
  }
  function setSig<K extends keyof SignatureBlock>(k: K, v: SignatureBlock[K]) {
    setState((s) => ({ ...s, signatures: { ...s.signatures, [k]: v } }));
    schedule({ signatures: { [k]: v } as Partial<SignatureBlock> });
  }

  const verdictTone = VERDICT_TONE[det.verdict];
  const categoriesByIndex = useMemo(() => {
    const map = new Map<string, CUICategory[]>();
    for (const c of categories) {
      const arr = map.get(c.organizationalIndex) ?? [];
      arr.push(c);
      map.set(c.organizationalIndex, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [categories]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            CUI DETERMINATION
          </div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            Is this information CUI?
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
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span className="font-serif text-2xl text-bone-50">
                  {VERDICT_LABEL[det.verdict]}
                </span>
                {det.recommendedCMMCLevel > 0 && (
                  <span className="border border-gold-300/60 bg-gold-300/10 px-2 py-0.5 font-mono text-[10px] tracking-widest2 text-gold-200">
                    CMMC LEVEL {det.recommendedCMMCLevel}
                  </span>
                )}
              </div>
              <div className="mt-1 text-sm text-bone-100">{det.headline}</div>
            </div>
          </div>
          <a
            href={`/api/reports/cui-determination?assessmentId=${assessmentId}`}
            className="inline-flex items-center gap-2 border border-gold-300/50 bg-gold-300/10 px-4 py-2.5 text-xs font-medium text-gold-100 hover:bg-gold-300 hover:text-ink-950"
          >
            <Download size={13} /> Download determination PDF
          </a>
        </div>
      </section>

      {det.rationale && (
        <section className="border border-ink-700 bg-ink-900 p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            RATIONALE
          </div>
          <p className="mt-2 text-sm text-bone-200 leading-relaxed">{det.rationale}</p>
        </section>
      )}

      {/* Section A — asset identification */}
      <section className="border border-ink-700 bg-ink-900 p-6">
        <SectionTitle
          number="A"
          title="Information asset identification"
          description="Identify the data being assessed. This context anchors the rest of the determination."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <FieldInput label="Asset name *" value={state.assetHeader.assetName} onChange={(v) => setHeaderField("assetName", v)} />
          <FieldInput label="Source / originator" value={state.assetHeader.source} onChange={(v) => setHeaderField("source", v)} placeholder="DoD program office · prime contractor · agency" />
          <FieldInput label="Format" value={state.assetHeader.format} onChange={(v) => setHeaderField("format", v)} placeholder="Digital · Paper · Mixed" />
          <FieldInput label="Storage systems" value={state.assetHeader.systems} onChange={(v) => setHeaderField("systems", v)} placeholder="SharePoint · GCC-High · on-prem file share" />
          <FieldInput label="Volume" value={state.assetHeader.volume} onChange={(v) => setHeaderField("volume", v)} placeholder="e.g. 12 GB · 3,400 documents" />
          <FieldSelect
            label="Linked to a DoD contract"
            value={state.assetHeader.dodContractLinked}
            onChange={(v) => setHeaderField("dodContractLinked", v as InfoAssetHeader["dodContractLinked"])}
            options={[
              { value: "", label: "— select —" },
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" }
            ]}
          />
          <FieldInput label="Linked contract # (if yes)" value={state.assetHeader.linkedContractNumber} onChange={(v) => setHeaderField("linkedContractNumber", v)} />
          <FieldTextarea label="Description" value={state.assetHeader.description} onChange={(v) => setHeaderField("description", v)} rows={3} full />
        </div>
      </section>

      {/* Section B — screening indicators */}
      <SectionCard section={sections[0]} state={state} setAnswer={setAnswer} setNote={setNote} />

      {/* Section C — category multi-select */}
      <section className="border border-ink-700 bg-ink-900">
        <header className="border-b border-ink-700 px-6 py-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            SECTION C
          </div>
          <h2 className="mt-1 font-serif text-2xl text-bone-50">CUI category identification</h2>
          <p className="mt-2 text-xs text-bone-400 leading-relaxed">
            Select every applicable category from the NARA CUI Registry. Categories flagged{" "}
            <span className="font-mono text-[10px] text-status-partial">SPECIFIED</span> invoke
            handling controls beyond the CUI Basic default. Reference: 32 CFR §2002.4, NARA CUI
            Registry, DoDI 5200.48.
          </p>
        </header>
        <div className="p-6 space-y-6">
          {categoriesByIndex.map(([index, cats]) => (
            <div key={index}>
              <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
                {index.toUpperCase()}
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {cats.map((c) => {
                  const selected = state.selectedCategoryCodes.includes(c.code);
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => toggleCategory(c.code)}
                      className={cn(
                        "flex items-start gap-3 border p-3 text-left transition",
                        selected
                          ? "border-gold-300/60 bg-gold-300/5"
                          : "border-ink-700 bg-ink-950 hover:border-bone-300"
                      )}
                    >
                      <div className="mt-0.5 flex h-4 w-4 items-center justify-center border border-ink-700 bg-ink-950">
                        {selected && <div className="h-2.5 w-2.5 bg-gold-300" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] tracking-widest2 text-gold-300">
                            {c.code}
                          </span>
                          {c.specifiedByDefault && (
                            <span className="border border-status-partial/60 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-status-partial">
                              SPECIFIED
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-bone-100">{c.name}</div>
                        <div className="mt-1 font-mono text-[10px] tracking-widest text-bone-500">
                          {c.authority}
                        </div>
                        {c.hint && (
                          <div className="mt-1 flex gap-1 text-[11px] italic text-bone-400">
                            <Info size={10} className="mt-0.5 shrink-0 text-gold-300" /> {c.hint}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <label className="block">
              <span className="text-[11px] uppercase tracking-widest text-bone-400">
                Other / free-text (if none of the above categories apply)
              </span>
              <textarea
                value={state.categoryOtherNote}
                onChange={(e) => setCategoryOther(e.target.value)}
                rows={2}
                placeholder="Describe the category or authority not listed above…"
                className="mt-1.5 w-full border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Section D — Specified indicators */}
      <SectionCard section={sections[1]} state={state} setAnswer={setAnswer} setNote={setNote} />

      {/* Section E — Enhanced */}
      <SectionCard section={sections[2]} state={state} setAnswer={setAnswer} setNote={setNote} />

      {/* Signatures */}
      <section className="border border-ink-700 bg-ink-900 p-6">
        <SectionTitle
          number="F"
          title="Sign-off"
          description="Prepared-by + approved-by fields printed on the PDF export."
        />
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

      {/* Section summary */}
      <section className="border border-ink-700 bg-ink-950 p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
          SECTION SUMMARY
        </div>
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
          <div className="flex flex-wrap items-center justify-between gap-3 border border-ink-700 bg-ink-900 px-4 py-3">
            <div>
              <div className="text-sm text-bone-100">Categories selected</div>
              <div className="font-mono text-[10px] tracking-widest text-bone-400">
                {det.categoryFindings.selected.length === 0
                  ? "None"
                  : det.categoryFindings.selected.map((c) => c.code).join(", ")}
                {det.categoryFindings.anySpecified && " · at least one SPECIFIED"}
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] tracking-widest2",
                det.categoryFindings.selected.length === 0
                  ? "border-ink-600 text-bone-400"
                  : det.categoryFindings.anySpecified
                  ? "border-status-partial/60 text-status-partial"
                  : "border-status-met/60 text-status-met"
              )}
            >
              <Tag size={11} />
              {det.categoryFindings.selected.length}
            </span>
          </div>
        </div>
      </section>

      <p className="text-xs text-bone-400">
        Every answer, category toggle, note, and signature autosaves. Downloading the PDF triggers a
        fresh render of the current record — no manual save required first.
      </p>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function SectionCard({
  section,
  state,
  setAnswer,
  setNote
}: {
  section: CUISection;
  state: CUIState;
  setAnswer: (id: string, v: AnswerValue) => void;
  setNote: (id: string, v: string) => void;
}) {
  return (
    <section className="border border-ink-700 bg-ink-900">
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
                  <span className="font-mono text-[10px] tracking-widest2 text-gold-300">
                    {q.number}
                  </span>
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
  );
}

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
  label, value, onChange, type = "text", placeholder
}: {
  label: string; value: string; onChange: (v: string) => void; type?: "text" | "date"; placeholder?: string;
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
  label, value, onChange, rows = 3, full = false
}: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; full?: boolean;
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
  label, value, onChange, options
}: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
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
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
