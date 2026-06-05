"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  Save,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ChecklistSection,
  DiagramSlot
} from "@/data/precmmc-checklist";
import { STATUS_OPTIONS } from "@/data/precmmc-checklist";
import type { PreCMMCState, Readiness, UploadedFile } from "@/lib/precmmc-store";

type Props = {
  assessmentId: string;
  clientName: string;
  reportingPeriod: string;
  sections: ChecklistSection[];
  diagramSlots: DiagramSlot[];
  uploadRules: { acceptedExtensions: readonly string[]; maxBytes: number };
  totalItems: number;
  initialState: PreCMMCState;
  initialReadiness: Readiness;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const STATUS_TONE_CLASS: Record<"ok" | "warn" | "bad", string> = {
  ok: "border-status-met/60 bg-status-metBg text-status-met",
  warn: "border-status-partial/60 bg-status-partialBg text-status-partial",
  bad: "border-status-failed/60 bg-status-failedBg text-status-failed"
};

export function PreCMMCWorkspace({
  assessmentId,
  clientName,
  reportingPeriod,
  sections,
  diagramSlots,
  uploadRules,
  totalItems,
  initialState,
  initialReadiness
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<PreCMMCState>(initialState);
  const [readiness, setReadiness] = useState<Readiness>(initialReadiness);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  /* ---------- API helpers ---------- */

  const flushSave = useCallback(
    async (patch: {
      header?: Partial<PreCMMCState["header"]>;
      items?: Record<string, Partial<PreCMMCState["items"][string]>>;
      freeNotes?: string;
    }) => {
      setSaveStatus("saving");
      setSaveError(null);
      try {
        const res = await fetch(`/api/admin/precmmc?assessmentId=${assessmentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Save failed");
        setState(data.state);
        setReadiness(data.readiness);
        setSaveStatus("saved");
        dirtyRef.current = false;
        setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 1600);
      } catch (err) {
        setSaveStatus("error");
        setSaveError(err instanceof Error ? err.message : "Save failed");
      }
    },
    [assessmentId]
  );

  function scheduleSave(patch: {
    header?: Partial<PreCMMCState["header"]>;
    items?: Record<string, Partial<PreCMMCState["items"][string]>>;
    freeNotes?: string;
  }) {
    dirtyRef.current = true;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void flushSave(patch);
    }, 450);
  }

  function setHeaderField<K extends keyof PreCMMCState["header"]>(key: K, value: string) {
    setState((s) => ({ ...s, header: { ...s.header, [key]: value } }));
    scheduleSave({ header: { [key]: value } });
  }

  function setItemStatus(itemId: string, status: string | null) {
    setState((s) => ({
      ...s,
      items: {
        ...s.items,
        [itemId]: {
          status,
          evidenceLocation: s.items[itemId]?.evidenceLocation,
          notes: s.items[itemId]?.notes,
          uploadIds: s.items[itemId]?.uploadIds ?? []
        }
      }
    }));
    scheduleSave({ items: { [itemId]: { status } } });
  }

  function setItemField(itemId: string, field: "evidenceLocation" | "notes", value: string) {
    setState((s) => ({
      ...s,
      items: {
        ...s.items,
        [itemId]: {
          status: s.items[itemId]?.status ?? null,
          evidenceLocation: s.items[itemId]?.evidenceLocation,
          notes: s.items[itemId]?.notes,
          uploadIds: s.items[itemId]?.uploadIds ?? [],
          [field]: value
        }
      }
    }));
    scheduleSave({ items: { [itemId]: { [field]: value } } });
  }

  function setNotes(value: string) {
    setState((s) => ({ ...s, freeNotes: value }));
    scheduleSave({ freeNotes: value });
  }

  async function uploadFile(slot: string, file: File): Promise<void> {
    setSaveError(null);
    // Client-side validation (server re-validates regardless)
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!uploadRules.acceptedExtensions.includes(ext)) {
      setSaveError(`Unsupported file type .${ext}. Allowed: ${uploadRules.acceptedExtensions.join(", ")}.`);
      setSaveStatus("error");
      return;
    }
    if (file.size > uploadRules.maxBytes) {
      setSaveError(`File is too large. Limit is ${uploadRules.maxBytes / 1024 / 1024} MB.`);
      setSaveStatus("error");
      return;
    }
    setSaveStatus("saving");
    try {
      const form = new FormData();
      form.append("slot", slot);
      form.append("file", file);
      const res = await fetch(`/api/admin/precmmc/upload?assessmentId=${assessmentId}`, {
        method: "POST",
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setState(data.state);
      setReadiness(data.readiness);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 1600);
      router.refresh();
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function removeFile(fileId: string): Promise<void> {
    if (!window.confirm("Delete this file? This cannot be undone.")) return;
    setSaveError(null);
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/admin/precmmc/files/${fileId}?assessmentId=${assessmentId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setState(data.state);
      setReadiness(data.readiness);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 1600);
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function filesFor(slot: string): UploadedFile[] {
    const ids = state.items[slot]?.uploadIds ?? [];
    return ids.map((id) => state.files[id]).filter(Boolean);
  }

  function toggleCollapsed(id: string) {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  }

  /* ---------- top KPIs ---------- */

  const kpis = useMemo(
    () => [
      { label: "TOTAL ITEMS", value: String(totalItems), tone: "neutral" as const },
      { label: "COMPLETED", value: String(readiness.completed), tone: "ok" as const },
      { label: "IN PROGRESS", value: String(readiness.inProgress), tone: "warn" as const },
      { label: "NOT STARTED", value: String(readiness.notStarted + readiness.unanswered), tone: "bad" as const },
      {
        label: "REQUIRED DIAGRAMS",
        value: `${2 - readiness.requiredDiagramsMissing.length}/2`,
        tone: readiness.requiredDiagramsMissing.length === 0 ? ("ok" as const) : ("bad" as const)
      },
      {
        label: "READINESS",
        value: `${readiness.readinessPct}%`,
        tone:
          readiness.readinessPct >= 90
            ? ("ok" as const)
            : readiness.readinessPct >= 60
            ? ("warn" as const)
            : ("bad" as const)
      }
    ],
    [readiness, totalItems]
  );

  /* ---------- alerts ---------- */

  const alerts: Array<{ tone: "ok" | "warn" | "bad"; label: string; detail: string }> = [];
  if (readiness.requiredDiagramsMissing.length > 0) {
    alerts.push({
      tone: "bad",
      label: "Missing required diagram",
      detail: `Upload the ${readiness.requiredDiagramsMissing
        .map((d) => (d === "network-architecture" ? "Network Architecture Diagram" : "Data Flow Diagram"))
        .join(" + ")}.`
    });
  }
  if (readiness.goNoGoBlocking) {
    alerts.push({
      tone: "bad",
      label: "Go / No-Go blocker",
      detail: 'Any "No" answer in Section 6 blocks assessment scheduling.'
    });
  }
  if (readiness.partialInTechnical) {
    alerts.push({
      tone: "warn",
      label: "Partial control implementation",
      detail: 'Each "Partial" in Section 3 must be entered on the POA&M with a due date.'
    });
  }
  if (readiness.goLiveReady) {
    alerts.push({
      tone: "ok",
      label: "Ready for C3PAO engagement",
      detail: "All Section 6 items are Yes and both required diagrams are uploaded."
    });
  }

  /* ---------- render ---------- */

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            PRE-CMMC ASSESSMENT CHECKLIST
          </div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            4-6 weeks before C3PAO.
          </h1>
          {clientName && (
            <p className="mt-2 text-xs text-bone-400">
              {clientName} · {reportingPeriod}
            </p>
          )}
        </div>
        <SaveIndicator status={saveStatus} error={saveError} />
      </header>

      {/* Sticky KPI band */}
      <section className="sticky top-16 z-20 -mx-8 border-y border-ink-700 bg-ink-950/95 px-8 py-4 backdrop-blur">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map((k) => (
            <KPI key={k.label} {...k} />
          ))}
        </div>
        {alerts.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {alerts.map((a, i) => (
              <AlertBanner key={i} {...a} />
            ))}
          </div>
        )}
      </section>

      {/* Header form */}
      <section className="border border-ink-700 bg-ink-900 p-6">
        <SectionTitle number={0} title="Header" description="Captures the assessment day metadata for this checklist." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <FieldText label="Client *" value={state.header.client} onChange={(v) => setHeaderField("client", v)} />
          <FieldText label="Assessor" value={state.header.assessor} onChange={(v) => setHeaderField("assessor", v)} />
          <FieldText label="Date" type="date" value={state.header.date} onChange={(v) => setHeaderField("date", v)} />
          <FieldTextarea
            label="In-Scope Systems"
            value={state.header.inScopeSystems}
            onChange={(v) => setHeaderField("inScopeSystems", v)}
            rows={3}
            full
          />
        </div>
      </section>

      {/* Diagram upload section */}
      <section className="border border-gold-300/40 bg-ink-900 p-6 shadow-gilt">
        <SectionTitle
          number={0}
          title="Required diagrams"
          description={`Upload the Network Architecture and Data Flow diagrams (max ${uploadRules.maxBytes /
            1024 /
            1024} MB each). System Context is optional.`}
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {diagramSlots.map((slot) => (
            <DiagramUploader
              key={slot.id}
              slot={slot}
              files={filesFor(slot.id)}
              onUpload={(file) => uploadFile(slot.id, file)}
              onRemove={removeFile}
              acceptedExtensions={uploadRules.acceptedExtensions}
              assessmentId={assessmentId}
            />
          ))}
        </div>
      </section>

      {/* Sections */}
      {sections.map((section) => {
        const isCollapsed = collapsed[section.id] ?? false;
        return (
          <section key={section.id} className="border border-ink-700 bg-ink-900">
            <header
              onClick={() => toggleCollapsed(section.id)}
              className="flex cursor-pointer items-center justify-between gap-4 border-b border-ink-700 px-6 py-4 hover:bg-ink-800/50"
            >
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
                  SECTION {section.number}
                </div>
                <h2 className="mt-1 font-serif text-2xl text-bone-50">{section.title}</h2>
                <p className="mt-1 text-xs text-bone-400">{section.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <SectionProgress section={section} state={state} />
                {isCollapsed ? (
                  <ChevronRight size={16} className="text-bone-400" />
                ) : (
                  <ChevronDown size={16} className="text-bone-400" />
                )}
              </div>
            </header>
            {!isCollapsed && (
              <div className="divide-y divide-ink-700/60">
                {section.items.map((item) => (
                  <ChecklistRow
                    key={item.id}
                    sectionOptionType={section.optionType}
                    item={item}
                    showEvidenceLocation={section.id === "technical-control-evidence"}
                    itemState={state.items[item.id] ?? { status: null, uploadIds: [] }}
                    files={filesFor(item.id)}
                    onStatus={(s) => setItemStatus(item.id, s)}
                    onField={(f, v) => setItemField(item.id, f, v)}
                    onUpload={(file) => uploadFile(item.id, file)}
                    onRemove={removeFile}
                    acceptedExtensions={uploadRules.acceptedExtensions}
                    assessmentId={assessmentId}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* Notes */}
      <section className="border border-ink-700 bg-ink-900 p-6">
        <SectionTitle number={0} title="Notes / Open Items" description="Free-form running log for the assessment team." />
        <textarea
          value={state.freeNotes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Outstanding questions, escalations, scheduling notes…"
          className="mt-3 w-full border border-ink-700 bg-ink-950 p-3 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
        />
      </section>

      {/* How-to-use footer */}
      <section className="border border-ink-700 bg-ink-950 p-5 text-xs text-bone-300">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-gold-300">
          <Info size={12} /> HOW TO USE
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Run through this checklist 4-6 weeks before engaging a C3PAO.</li>
          <li>Upload the Network Architecture and Data Flow diagrams in the Required diagrams section.</li>
          <li>Anything marked &quot;Partial&quot; or &quot;No&quot; goes on the POA&amp;M with a due date.</li>
          <li>CMMC Level 2 requires 110/110 NIST 800-171 controls fully implemented at assessment — no partials accepted.</li>
          <li>Click any item to add evidence pointers and upload supporting documentation.</li>
          <li>Dashboard updates in real-time as items are completed and files uploaded.</li>
        </ul>
      </section>
    </div>
  );
}

/* ============================== Subcomponents ============================== */

function SaveIndicator({ status, error }: { status: SaveStatus; error: string | null }) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-bone-400">
        <Save size={11} /> SAVING…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-status-met">
        <CheckCircle2 size={11} /> SAVED
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-status-failed" title={error ?? undefined}>
        <AlertCircle size={11} /> {error ?? "ERROR"}
      </span>
    );
  }
  return (
    <span className="font-mono text-[10px] tracking-widest text-bone-500">
      AUTOSAVE ENABLED
    </span>
  );
}

function KPI({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "bad" | "neutral" }) {
  const accent =
    tone === "ok"
      ? "text-status-met"
      : tone === "warn"
      ? "text-status-partial"
      : tone === "bad"
      ? "text-status-failed"
      : "text-bone-50";
  return (
    <div className="border border-ink-700 bg-ink-900 px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{label}</div>
      <div className={cn("mt-1 font-serif text-2xl", accent)}>{value}</div>
    </div>
  );
}

function AlertBanner({ tone, label, detail }: { tone: "ok" | "warn" | "bad"; label: string; detail: string }) {
  const Icon = tone === "ok" ? CheckCircle2 : tone === "warn" ? AlertTriangle : AlertCircle;
  return (
    <div className={cn("flex items-start gap-2 border px-3 py-2", STATUS_TONE_CLASS[tone])}>
      <Icon size={14} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-widest">{label}</div>
        <div className="mt-0.5 text-xs">{detail}</div>
      </div>
    </div>
  );
}

function SectionTitle({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <header>
      {number > 0 && (
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">SECTION {number}</div>
      )}
      <h2 className="mt-1 font-serif text-xl text-bone-50">{title}</h2>
      <p className="mt-1 text-xs text-bone-400">{description}</p>
    </header>
  );
}

function SectionProgress({
  section,
  state
}: {
  section: ChecklistSection;
  state: PreCMMCState;
}) {
  let answered = 0;
  let positive = 0;
  for (const item of section.items) {
    const s = state.items[item.id]?.status ?? null;
    if (s !== null) answered += 1;
    if (s === "yes" || s === "implemented") positive += 1;
  }
  const total = section.items.length;
  return (
    <span
      className={cn(
        "font-mono text-[10px] tracking-widest2 border px-2 py-0.5",
        positive === total
          ? "border-status-met/60 text-status-met"
          : answered === 0
          ? "border-ink-600 text-bone-400"
          : "border-status-partial/60 text-status-partial"
      )}
    >
      {positive}/{total}
    </span>
  );
}

function ChecklistRow({
  sectionOptionType,
  item,
  showEvidenceLocation,
  itemState,
  files,
  onStatus,
  onField,
  onUpload,
  onRemove,
  acceptedExtensions,
  assessmentId
}: {
  sectionOptionType: "tri" | "tech" | "binary";
  item: { id: string; label: string; requirement: string; uploadHint?: string; controlId?: string };
  showEvidenceLocation: boolean;
  itemState: { status: string | null; evidenceLocation?: string; notes?: string; uploadIds: string[] };
  files: UploadedFile[];
  onStatus: (s: string | null) => void;
  onField: (f: "evidenceLocation" | "notes", v: string) => void;
  onUpload: (file: File) => Promise<void>;
  onRemove: (fileId: string) => Promise<void>;
  acceptedExtensions: readonly string[];
  assessmentId: string;
}) {
  const options = STATUS_OPTIONS[sectionOptionType];
  const selectedOption = options.find((o) => o.value === itemState.status);

  return (
    <article className="grid gap-3 px-6 py-4 lg:grid-cols-12">
      {/* Title + requirement */}
      <div className="lg:col-span-5">
        <div className="flex items-center gap-2">
          {item.controlId && (
            <span className="font-mono text-[10px] tracking-widest2 text-gold-300">{item.controlId}</span>
          )}
          <span className="text-sm text-bone-100">{item.label}</span>
        </div>
        <p className="mt-1 text-[11px] text-bone-400">{item.requirement}</p>
      </div>

      {/* Status dropdown */}
      <div className="lg:col-span-2">
        <select
          value={itemState.status ?? ""}
          onChange={(e) => onStatus(e.target.value || null)}
          className={cn(
            "w-full border bg-ink-950 px-2.5 py-1.5 text-xs focus:outline-none",
            selectedOption ? STATUS_TONE_CLASS[selectedOption.tone] : "border-ink-700 text-bone-300"
          )}
        >
          <option value="">— select —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Evidence location text (section 3 only) */}
      <div className="lg:col-span-2">
        {showEvidenceLocation ? (
          <input
            value={itemState.evidenceLocation ?? ""}
            onChange={(e) => onField("evidenceLocation", e.target.value)}
            placeholder="Evidence location…"
            className="w-full border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
          />
        ) : (
          <input
            value={itemState.notes ?? ""}
            onChange={(e) => onField("notes", e.target.value)}
            placeholder="Notes…"
            className="w-full border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
          />
        )}
      </div>

      {/* Files + upload */}
      <div className="lg:col-span-3">
        <FileSlot
          slotLabel={item.uploadHint ?? "Upload evidence"}
          files={files}
          onUpload={onUpload}
          onRemove={onRemove}
          acceptedExtensions={acceptedExtensions}
          assessmentId={assessmentId}
        />
      </div>
    </article>
  );
}

function DiagramUploader({
  slot,
  files,
  onUpload,
  onRemove,
  acceptedExtensions,
  assessmentId
}: {
  slot: DiagramSlot;
  files: UploadedFile[];
  onUpload: (file: File) => Promise<void>;
  onRemove: (fileId: string) => Promise<void>;
  acceptedExtensions: readonly string[];
  assessmentId: string;
}) {
  const required = slot.required;
  const present = files.length > 0;
  const accentBorder = required && !present
    ? "border-status-failed/60"
    : present
    ? "border-status-met/60"
    : "border-ink-700";

  return (
    <div className={cn("flex flex-col border bg-ink-950 p-4", accentBorder)}>
      <header className="flex items-baseline justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">{slot.label.toUpperCase()}</div>
          <h3 className="mt-1 text-sm text-bone-100">{slot.description}</h3>
        </div>
        <span
          className={cn(
            "font-mono text-[9px] tracking-widest2 border px-1.5 py-0.5",
            required ? "border-status-failed/60 text-status-failed" : "border-ink-600 text-bone-400"
          )}
        >
          {required ? "REQUIRED" : "OPTIONAL"}
        </span>
      </header>

      <ul className="mt-3 list-disc space-y-0.5 pl-5 text-[11px] text-bone-400">
        {slot.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <div className="mt-4 flex-1">
        <FileSlot
          slotLabel={`Upload ${slot.label}`}
          files={files}
          onUpload={onUpload}
          onRemove={onRemove}
          acceptedExtensions={acceptedExtensions}
          assessmentId={assessmentId}
          stacked
        />
      </div>
    </div>
  );
}

function FileSlot({
  slotLabel,
  files,
  onUpload,
  onRemove,
  acceptedExtensions,
  assessmentId,
  stacked = false
}: {
  slotLabel: string;
  files: UploadedFile[];
  onUpload: (file: File) => Promise<void>;
  onRemove: (fileId: string) => Promise<void>;
  acceptedExtensions: readonly string[];
  assessmentId: string;
  stacked?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const accept = acceptedExtensions.map((e) => `.${e}`).join(",");

  return (
    <div className={stacked ? "flex flex-col gap-2" : "flex flex-col gap-1.5"}>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center justify-center gap-1.5 border border-gold-300/40 bg-gold-300/5 px-2.5 py-1.5 text-[11px] text-gold-100 hover:bg-gold-300 hover:text-ink-950 disabled:opacity-60"
      >
        <Upload size={11} /> {uploading ? "Uploading…" : slotLabel}
      </button>
      <input ref={inputRef} type="file" accept={accept} onChange={onChange} className="hidden" />

      {files.length === 0 ? (
        <p className="font-mono text-[10px] tracking-widest text-bone-500">
          NO FILES · ACCEPTS {acceptedExtensions.slice(0, 6).join(", ").toUpperCase()}…
        </p>
      ) : (
        <ul className="space-y-1">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-2 border border-ink-700 bg-ink-900 px-2 py-1.5"
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <FileText size={11} className="text-bone-400 shrink-0" />
                <div className="min-w-0">
                  <div className="truncate text-[11px] text-bone-100" title={f.originalName}>
                    {f.originalName}
                  </div>
                  <div className="font-mono text-[9px] tracking-widest text-bone-500">
                    {(f.size / 1024).toFixed(0)} KB · {f.uploadedAt.slice(0, 10)}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={`/api/admin/precmmc/files/${f.id}?assessmentId=${assessmentId}&download=1`}
                  className="border border-ink-700 px-1.5 py-1 text-bone-300 hover:border-gold-300/40 hover:text-gold-100"
                  title="Download"
                >
                  <Download size={11} />
                </a>
                <button
                  type="button"
                  onClick={() => onRemove(f.id)}
                  className="border border-ink-700 px-1.5 py-1 text-bone-300 hover:border-status-failed/60 hover:text-status-failed"
                  title="Delete"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FieldText({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "date";
}) {
  return (
    <label>
      <span className="text-[11px] uppercase tracking-widest text-bone-400">{label}</span>
      <input
        type={type}
        value={value}
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
    <label className={full ? "sm:col-span-2" : undefined}>
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
