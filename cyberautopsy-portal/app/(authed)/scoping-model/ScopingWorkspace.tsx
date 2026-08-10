"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
  Trash2,
  Layers,
  Server,
  Users,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_META,
  DATA_TYPES,
  KIND_META,
  suggestCategory,
  type DataType,
  type ScopeCategory,
  type ScopeItem,
  type ScopeKind,
  type ScopingSummary,
  type SignatureBlock
} from "@/data/scoping-model";
import type { ScopingState } from "@/lib/scoping-store";

type Props = {
  assessmentId: string;
  clientName: string;
  reportingPeriod: string;
  initialState: ScopingState;
  initialSummary: ScopingSummary;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const KIND_ICON: Record<ScopeKind, typeof Layers> = {
  application: Layers,
  technology: Server,
  people: Users
};

const CATEGORY_TONE_CLASS: Record<
  ScopeCategory | "",
  string
> = {
  cui_asset: "border-status-failed/60 bg-status-failedBg text-status-failed",
  security_protection: "border-status-partial/60 bg-status-partialBg text-status-partial",
  crma: "border-status-review/60 bg-status-reviewBg text-status-review",
  specialized: "border-status-review/60 bg-status-reviewBg text-status-review",
  fci_asset: "border-gold-300/60 bg-gold-300/10 text-gold-200",
  out_of_scope: "border-status-met/60 bg-status-metBg text-status-met",
  "": "border-ink-600 text-bone-400"
};

const CMMC_TONE: Record<ScopingSummary["cmmcApplicability"], "ok" | "warn" | "bad" | "neutral"> = {
  level_2_or_higher: "bad",
  level_1_only: "warn",
  none_indicated: "ok",
  indeterminate: "neutral"
};

const CMMC_LABEL: Record<ScopingSummary["cmmcApplicability"], string> = {
  level_2_or_higher: "CMMC LEVEL 2 (OR HIGHER)",
  level_1_only: "CMMC LEVEL 1",
  none_indicated: "CMMC NOT APPLICABLE",
  indeterminate: "INDETERMINATE"
};

const emptyDraft = (kind: ScopeKind): Omit<ScopeItem, "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy"> => ({
  kind,
  name: "",
  description: "",
  owner: "",
  location: "",
  vendor: "",
  boundaryModel: "",
  dataTypes: [],
  scopeCategory: "",
  scopeRationale: "",
  connectsToCUI: ""
});

export function ScopingWorkspace({
  assessmentId,
  clientName,
  reportingPeriod,
  initialState,
  initialSummary
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<ScopingState>(initialState);
  const [summary, setSummary] = useState<ScopingSummary>(initialSummary);
  const [tab, setTab] = useState<ScopeKind | "all">("all");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState<ScopeKind | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function call(body: unknown) {
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/scoping?assessmentId=${assessmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setState(data.state);
      setSummary(data.summary);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 1600);
      return data;
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Save failed");
      throw err;
    }
  }

  function scheduleMetaSave(patch: { notes?: string; signatures?: Partial<SignatureBlock> }) {
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void call({ action: "meta", ...patch }), 450);
  }

  function setNotes(v: string) {
    setState((s) => ({ ...s, notes: v }));
    scheduleMetaSave({ notes: v });
  }
  function setSig<K extends keyof SignatureBlock>(k: K, v: SignatureBlock[K]) {
    setState((s) => ({ ...s, signatures: { ...s.signatures, [k]: v } }));
    scheduleMetaSave({ signatures: { [k]: v } });
  }

  async function addItem(item: Omit<ScopeItem, "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy">) {
    // Auto-suggest scope category if the assessor didn't pick one
    const suggested =
      item.scopeCategory || suggestCategory({ kind: item.kind, dataTypes: item.dataTypes, connectsToCUI: item.connectsToCUI });
    await call({ action: "add", item: { ...item, scopeCategory: suggested } });
    setShowAdd(null);
  }
  async function updateItem(itemId: string, patch: Partial<ScopeItem>) {
    await call({ action: "update", itemId, patch });
  }
  async function removeItem(itemId: string) {
    if (!window.confirm("Remove this scope item?")) return;
    await call({ action: "remove", itemId });
  }

  const visibleItems = useMemo(
    () => (tab === "all" ? state.items : state.items.filter((i) => i.kind === tab)),
    [state.items, tab]
  );

  const cmmcTone = CMMC_TONE[summary.cmmcApplicability];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            FCI / CUI SCOPING MODEL
          </div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            What is in scope?
          </h1>
          {clientName && (
            <p className="mt-2 text-xs text-bone-400">
              {clientName} · {reportingPeriod}
            </p>
          )}
        </div>
        <SaveIndicator status={saveStatus} error={saveError} />
      </header>

      {/* Verdict banner */}
      <section
        className={cn(
          "sticky top-16 z-20 border p-5 shadow-gilt",
          cmmcTone === "bad"
            ? "border-status-failed/60 bg-status-failedBg"
            : cmmcTone === "warn"
            ? "border-status-partial/60 bg-status-partialBg"
            : cmmcTone === "ok"
            ? "border-status-met/60 bg-status-metBg"
            : "border-ink-700 bg-ink-900"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Layers size={22} className="mt-1" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
                BOUNDARY SUMMARY
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span className="font-serif text-2xl text-bone-50">
                  {CMMC_LABEL[summary.cmmcApplicability]}
                </span>
              </div>
              <div className="mt-1 text-sm text-bone-100">{summary.headline}</div>
            </div>
          </div>
          <a
            href={`/api/reports/scoping-model?assessmentId=${assessmentId}`}
            className="inline-flex items-center gap-2 border border-gold-300/50 bg-gold-300/10 px-4 py-2.5 text-xs font-medium text-gold-100 hover:bg-gold-300 hover:text-ink-950"
          >
            <Download size={13} /> Download scoping PDF
          </a>
        </div>
      </section>

      {/* KPI band */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Applications" value={String(summary.totals.applications)} tone="neutral" />
        <KPI label="Technology" value={String(summary.totals.technology)} tone="neutral" />
        <KPI label="People / Roles" value={String(summary.totals.people)} tone="neutral" />
        <KPI
          label="Unclassified"
          value={String(summary.totals.unclassified)}
          tone={summary.totals.unclassified > 0 ? "bad" : "ok"}
        />
      </section>

      {/* Category matrix */}
      <section className="border border-ink-700 bg-ink-900 p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
          INVENTORY BY CATEGORY
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-700 font-mono text-[10px] uppercase tracking-widest text-bone-400">
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4 text-center">Apps</th>
                <th className="py-2 pr-4 text-center">Tech</th>
                <th className="py-2 pr-4 text-center">People</th>
                <th className="py-2 pr-4 text-center">Total</th>
                <th className="py-2">Controls posture</th>
              </tr>
            </thead>
            <tbody>
              {summary.perCategory.map((c) => (
                <tr key={c.category} className="border-b border-ink-700/60">
                  <td className="py-3 pr-4">
                    <div className="text-bone-100">{c.meta.label}</div>
                    <div className="font-mono text-[10px] tracking-widest text-bone-500">
                      {c.meta.shortLabel}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-center text-bone-100">{c.applications}</td>
                  <td className="py-3 pr-4 text-center text-bone-100">{c.technology}</td>
                  <td className="py-3 pr-4 text-center text-bone-100">{c.people}</td>
                  <td className="py-3 pr-4 text-center font-mono text-bone-50">{c.total}</td>
                  <td className="py-3 text-xs text-bone-400">{c.meta.controlsRequired}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Kind tabs */}
      <section>
        <div className="flex flex-wrap items-center gap-2">
          <TabPill active={tab === "all"} onClick={() => setTab("all")}>
            All ({state.items.length})
          </TabPill>
          {(["application", "technology", "people"] as ScopeKind[]).map((k) => {
            const Icon = KIND_ICON[k];
            const count = state.items.filter((i) => i.kind === k).length;
            return (
              <TabPill key={k} active={tab === k} onClick={() => setTab(k)}>
                <Icon size={12} /> {KIND_META[k].label} ({count})
              </TabPill>
            );
          })}
          <div className="ml-auto flex gap-2">
            {(["application", "technology", "people"] as ScopeKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setShowAdd(k)}
                className="inline-flex items-center gap-1.5 border border-gold-300/40 bg-gold-300/5 px-3 py-1.5 text-xs text-gold-100 hover:bg-gold-300 hover:text-ink-950"
              >
                <Plus size={11} /> Add {k}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="space-y-3">
        {visibleItems.length === 0 ? (
          <div className="border border-dashed border-ink-700 bg-ink-900 p-8 text-center text-xs text-bone-400">
            No {tab === "all" ? "items" : KIND_META[tab as ScopeKind].label.toLowerCase()} yet. Use
            the buttons above to add applications, technology, or people to the inventory.
          </div>
        ) : (
          visibleItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onUpdate={(patch) => updateItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
            />
          ))
        )}
      </section>

      {/* Notes + signatures */}
      <section className="border border-ink-700 bg-ink-900 p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
          SCOPING NOTES
        </div>
        <textarea
          value={state.notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Boundary decisions, isolating controls, exclusions, exception rationales…"
          className="mt-3 w-full border border-ink-700 bg-ink-950 p-3 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
        />
      </section>

      <section className="border border-ink-700 bg-ink-900 p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
          SIGN-OFF
        </div>
        <div className="mt-3 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
              PREPARED BY
            </div>
            <div className="mt-3 grid gap-3">
              <FieldInput label="Name" value={state.signatures.preparedByName} onChange={(v) => setSig("preparedByName", v)} />
              <FieldInput label="Title" value={state.signatures.preparedByTitle} onChange={(v) => setSig("preparedByTitle", v)} />
              <FieldInput label="Date" type="date" value={state.signatures.preparedByDate} onChange={(v) => setSig("preparedByDate", v)} />
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
              APPROVED BY
            </div>
            <div className="mt-3 grid gap-3">
              <FieldInput label="Name" value={state.signatures.approvedByName} onChange={(v) => setSig("approvedByName", v)} />
              <FieldInput label="Title" value={state.signatures.approvedByTitle} onChange={(v) => setSig("approvedByTitle", v)} />
              <FieldInput label="Date" type="date" value={state.signatures.approvedByDate} onChange={(v) => setSig("approvedByDate", v)} />
            </div>
          </div>
        </div>
      </section>

      <p className="text-xs text-bone-400">
        Every change autosaves. Downloading the PDF renders the current state — no manual save
        required first.
      </p>

      {showAdd && (
        <AddDialog
          kind={showAdd}
          onClose={() => setShowAdd(null)}
          onAdd={addItem}
        />
      )}
    </div>
  );
}

/* ---------- subcomponents ---------- */

function KPI({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "bad" | "neutral" }) {
  const accent =
    tone === "ok" ? "text-status-met" :
    tone === "warn" ? "text-status-partial" :
    tone === "bad" ? "text-status-failed" :
    "text-bone-50";
  return (
    <div className="border border-ink-700 bg-ink-900 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{label}</div>
      <div className={cn("mt-2 font-serif text-3xl", accent)}>{value}</div>
    </div>
  );
}

function TabPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[11px] tracking-widest2 transition",
        active
          ? "border-gold-300/60 bg-gold-300/10 text-gold-100"
          : "border-ink-700 text-bone-300 hover:border-bone-300 hover:text-bone-100"
      )}
    >
      {children}
    </button>
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

function ItemCard({
  item,
  onUpdate,
  onRemove
}: {
  item: ScopeItem;
  onUpdate: (patch: Partial<ScopeItem>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const KindIcon = KIND_ICON[item.kind];
  const cat = item.scopeCategory ? CATEGORY_META[item.scopeCategory] : null;

  return (
    <article className="border border-ink-700 bg-ink-900">
      <header className="flex items-start justify-between gap-4 p-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center border border-gold-300/40 bg-gold-300/5 text-gold-300 shrink-0">
            <KindIcon size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-serif text-lg text-bone-50 truncate">{item.name || "(unnamed)"}</span>
              <span
                className={cn(
                  "border px-2 py-0.5 font-mono text-[9px] tracking-widest2",
                  CATEGORY_TONE_CLASS[item.scopeCategory]
                )}
              >
                {cat ? cat.shortLabel : "UNCLASSIFIED"}
              </span>
            </div>
            <div className="mt-1 font-mono text-[10px] text-bone-400">
              {[item.owner && `owner: ${item.owner}`, item.location && `loc: ${item.location}`, item.vendor && `vendor: ${item.vendor}`, item.dataTypes.length > 0 && `data: ${item.dataTypes.join(", ")}`]
                .filter(Boolean).join("  ·  ") || "no metadata"}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="border border-ink-700 px-3 py-1 font-mono text-[10px] tracking-widest2 text-bone-300 hover:border-gold-300/40 hover:text-gold-200"
          >
            {expanded ? "COLLAPSE" : "EDIT"}
          </button>
          <button
            type="button"
            onClick={onRemove}
            title="Remove"
            className="border border-ink-700 p-1.5 text-bone-300 hover:border-status-failed/60 hover:text-status-failed"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </header>
      {expanded && (
        <div className="border-t border-ink-700 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <FieldInput label="Name" value={item.name} onChange={(v) => onUpdate({ name: v })} />
            <FieldInput label="Owner / responsible party" value={item.owner} onChange={(v) => onUpdate({ owner: v })} />
            <FieldInput label={item.kind === "people" ? "Department" : "Location / cloud region"} value={item.location} onChange={(v) => onUpdate({ location: v })} />
            {item.kind === "application" && (
              <FieldInput label="Vendor" value={item.vendor ?? ""} onChange={(v) => onUpdate({ vendor: v })} />
            )}
            {(item.kind === "application" || item.kind === "technology") && (
              <FieldSelect
                label="Boundary / hosting model"
                value={item.boundaryModel}
                onChange={(v) => onUpdate({ boundaryModel: v as ScopeItem["boundaryModel"] })}
                options={[
                  { value: "", label: "— select —" },
                  { value: "on-premise", label: "On-premise" },
                  { value: "private-cloud", label: "Private cloud" },
                  { value: "gcc-high", label: "GCC-High" },
                  { value: "commercial-cloud", label: "Commercial cloud" },
                  { value: "hybrid", label: "Hybrid" },
                  { value: "vendor-hosted", label: "Vendor-hosted SaaS" }
                ]}
              />
            )}
            <FieldSelect
              label="Connects to CUI environment"
              value={item.connectsToCUI}
              onChange={(v) => onUpdate({ connectsToCUI: v as ScopeItem["connectsToCUI"] })}
              options={[
                { value: "", label: "— select —" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "unknown", label: "Unknown" }
              ]}
            />
            <FieldTextarea label="Description" value={item.description} onChange={(v) => onUpdate({ description: v })} rows={2} full />
          </div>

          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
              Data types handled
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DATA_TYPES.map((dt) => {
                const selected = item.dataTypes.includes(dt);
                return (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? item.dataTypes.filter((d) => d !== dt)
                        : [...item.dataTypes, dt];
                      onUpdate({ dataTypes: next });
                    }}
                    className={cn(
                      "border px-2.5 py-1 font-mono text-[10px] tracking-widest2 transition",
                      selected
                        ? "border-gold-300/60 bg-gold-300/10 text-gold-100"
                        : "border-ink-700 text-bone-300 hover:border-bone-300"
                    )}
                  >
                    {dt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
                Scope category
              </div>
              <div className="mt-2 grid gap-1.5">
                {(Object.keys(CATEGORY_META) as ScopeCategory[]).map((cat) => {
                  const m = CATEGORY_META[cat];
                  const selected = item.scopeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onUpdate({ scopeCategory: cat })}
                      className={cn(
                        "flex items-center justify-between gap-2 border px-3 py-2 text-left text-xs transition",
                        selected
                          ? CATEGORY_TONE_CLASS[cat]
                          : "border-ink-700 text-bone-300 hover:border-bone-300"
                      )}
                    >
                      <span className="font-mono text-[10px] tracking-widest2">
                        {m.shortLabel}
                      </span>
                      <span className="flex-1 text-bone-100">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <FieldTextarea
              label="Classification rationale"
              value={item.scopeRationale}
              onChange={(v) => onUpdate({ scopeRationale: v })}
              rows={8}
              full
            />
          </div>

          {item.scopeCategory && (
            <div className="mt-4 border border-ink-700 bg-ink-950 p-3 text-xs text-bone-300">
              <div className="flex items-start gap-2">
                <Info size={12} className="mt-0.5 shrink-0 text-gold-300" />
                <div>
                  <div className="text-bone-100">{CATEGORY_META[item.scopeCategory].label}</div>
                  <div className="mt-1">{CATEGORY_META[item.scopeCategory].description}</div>
                  <div className="mt-1 italic text-bone-400">
                    Controls: {CATEGORY_META[item.scopeCategory].controlsRequired}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function AddDialog({
  kind,
  onClose,
  onAdd
}: {
  kind: ScopeKind;
  onClose: () => void;
  onAdd: (item: Omit<ScopeItem, "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy">) => Promise<void>;
}) {
  const [draft, setDraft] = useState(emptyDraft(kind));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) {
      setErr("Name is required.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onAdd(draft);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Add failed");
    } finally {
      setSaving(false);
    }
  }

  const KindIcon = KIND_ICON[kind];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gold-300/40 bg-ink-900 shadow-gilt">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-700 bg-ink-900 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center border border-gold-300/40 bg-gold-300/5 text-gold-300">
              <KindIcon size={14} />
            </span>
            <h2 className="font-serif text-xl text-bone-50">Add {KIND_META[kind].label.replace(/s$/, "")}</h2>
          </div>
          <button onClick={onClose} className="text-bone-400 hover:text-bone-100 font-mono text-[10px]">
            CANCEL
          </button>
        </header>
        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <FieldInput label="Name *" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder={kind === "people" ? "e.g. Jane Doe / Contracting Officer" : "e.g. Microsoft 365 GCC-High / Firewall A / SolarWinds"} />
            <FieldInput label="Owner" value={draft.owner} onChange={(v) => setDraft({ ...draft, owner: v })} />
            <FieldInput label={kind === "people" ? "Department" : "Location / region"} value={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} />
            {kind === "application" && (
              <FieldInput label="Vendor" value={draft.vendor ?? ""} onChange={(v) => setDraft({ ...draft, vendor: v })} />
            )}
            {(kind === "application" || kind === "technology") && (
              <FieldSelect
                label="Hosting model"
                value={draft.boundaryModel}
                onChange={(v) => setDraft({ ...draft, boundaryModel: v as ScopeItem["boundaryModel"] })}
                options={[
                  { value: "", label: "— select —" },
                  { value: "on-premise", label: "On-premise" },
                  { value: "private-cloud", label: "Private cloud" },
                  { value: "gcc-high", label: "GCC-High" },
                  { value: "commercial-cloud", label: "Commercial cloud" },
                  { value: "hybrid", label: "Hybrid" },
                  { value: "vendor-hosted", label: "Vendor-hosted SaaS" }
                ]}
              />
            )}
            <FieldSelect
              label="Connects to CUI environment"
              value={draft.connectsToCUI}
              onChange={(v) => setDraft({ ...draft, connectsToCUI: v as ScopeItem["connectsToCUI"] })}
              options={[
                { value: "", label: "— select —" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "unknown", label: "Unknown" }
              ]}
            />
            <FieldTextarea label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} full />
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
              Data types handled
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DATA_TYPES.map((dt) => {
                const selected = draft.dataTypes.includes(dt);
                return (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? draft.dataTypes.filter((d) => d !== dt)
                        : [...draft.dataTypes, dt];
                      setDraft({ ...draft, dataTypes: next });
                    }}
                    className={cn(
                      "border px-2.5 py-1 font-mono text-[10px] tracking-widest2 transition",
                      selected
                        ? "border-gold-300/60 bg-gold-300/10 text-gold-100"
                        : "border-ink-700 text-bone-300 hover:border-bone-300"
                    )}
                  >
                    {dt}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] italic text-bone-400">
              Tip: leave scope category blank and the system suggests one based on data types + CUI
              connectivity. You can override in the item card after adding.
            </p>
          </div>

          {err && (
            <div className="flex items-center gap-2 border border-status-failed/60 bg-status-failedBg px-3 py-2 text-xs text-status-failed">
              <AlertCircle size={12} /> {err}
            </div>
          )}
          <div className="flex items-center justify-end gap-2 border-t border-ink-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-ink-700 px-4 py-2 text-xs text-bone-200 hover:border-bone-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
            >
              <Plus size={12} /> {saving ? "Adding…" : "Add to inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
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
    <label className={full ? "block sm:col-span-2 md:col-span-2" : "block"}>
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
