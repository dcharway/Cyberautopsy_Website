"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  FileText,
  AlertOctagon,
  History,
  MessageSquare,
  Paperclip,
  Plus,
  Check,
  Save,
  AlertCircle,
  Lock,
  type LucideIcon
} from "lucide-react";
import type { Control, ControlStatus } from "@/lib/types";
import type { EvidenceItem } from "@/lib/evidence-store";
import type { POAMItem } from "@/lib/poam-store";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { getCatalogEntry } from "@/data/evidence-catalog";

type Tab = "overview" | "evidence" | "poam" | "history" | "notes";

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "Overview",       icon: FileText },
  { key: "evidence", label: "Evidence",       icon: Paperclip },
  { key: "poam",     label: "POA&M",          icon: AlertOctagon },
  { key: "history",  label: "History",        icon: History },
  { key: "notes",    label: "Assessor Notes", icon: MessageSquare }
];

const STATUS_OPTIONS: ControlStatus[] = [
  "Implemented",
  "Partial",
  "Not Implemented",
  "Not Applicable",
  "Not Started",
  "Under Review"
];

type Props = {
  control: Control | null;
  onClose: () => void;
  canEdit: boolean;
  assessmentId: string | null;
  evidence: EvidenceItem[];
  poam: POAMItem | null;
  onUpdate: (controlId: string, patch: Partial<Control>) => void;
};

export function ControlDrawer({
  control,
  onClose,
  canEdit,
  assessmentId,
  evidence,
  poam,
  onUpdate
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const open = control !== null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset tab when switching controls
  useEffect(() => {
    if (open) setTab("overview");
  }, [control?.id, open]);

  async function patchControl(updates: Partial<Control>) {
    if (!control || !canEdit) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/controls/${encodeURIComponent(control.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      onUpdate(control.id, updates);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink-950/70 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Control detail"
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-[640px] border-l border-gold-300/30 bg-ink-900 shadow-gilt transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {control && (
          <div className="flex h-full flex-col">
            {/* Header */}
            <header className="border-b border-ink-700 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
                    {control.family} · SSP §{control.sspSection} · Weight {control.weight}
                  </div>
                  <h2 className="mt-2 font-serif text-2xl tracking-tightest text-bone-50">
                    {control.name}
                  </h2>
                  <div className="mt-1 font-mono text-xs text-bone-400">{control.id}</div>
                </div>
                <button
                  type="button"
                  aria-label="Close drawer"
                  onClick={onClose}
                  className="rounded border border-ink-700 p-1.5 text-bone-300 hover:border-bone-300 hover:text-bone-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <StatusBadge status={control.status} />
                {control.owner && (
                  <span className="font-mono text-[10px] tracking-widest2 text-bone-400">
                    OWNER · {control.owner}
                  </span>
                )}
                {control.lastReviewed && (
                  <span className="font-mono text-[10px] tracking-widest2 text-bone-400">
                    REVIEWED · {control.lastReviewed}
                  </span>
                )}
              </div>

              {!canEdit && (
                <div className="mt-4 flex items-center gap-2 border border-ink-700 bg-ink-950 px-3 py-2 font-mono text-[10px] tracking-widest text-bone-400">
                  <Lock size={11} />
                  {assessmentId
                    ? "READ-ONLY — Admin role required to edit."
                    : "READ-ONLY — Set an active assessment in /admin/clients to enable edits."}
                </div>
              )}
              {error && (
                <div className="mt-4 flex items-center gap-2 border border-status-failed/60 bg-status-failedBg px-3 py-2 text-xs text-status-failed">
                  <AlertCircle size={12} /> {error}
                </div>
              )}
            </header>

            {/* Tabs */}
            <nav className="flex border-b border-ink-700 px-3" aria-label="Detail sections">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-3 text-xs font-medium tracking-wide border-b-2",
                      active
                        ? "border-gold-300 text-gold-100"
                        : "border-transparent text-bone-300 hover:text-bone-100"
                    )}
                  >
                    <Icon size={13} />
                    {t.label}
                  </button>
                );
              })}
            </nav>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {tab === "overview" && (
                <Overview control={control} canEdit={canEdit} onSave={patchControl} />
              )}
              {tab === "evidence" && (
                <EvidenceTab
                  control={control}
                  canEdit={canEdit}
                  evidence={evidence}
                  assessmentId={assessmentId}
                  reviewed={control.acceptableEvidenceReviewed ?? []}
                  onSaveReview={(next) =>
                    patchControl({
                      acceptableEvidenceReviewed: next,
                      lastReviewed: new Date().toISOString().slice(0, 10)
                    })
                  }
                  onCreated={() => router.refresh()}
                />
              )}
              {tab === "poam" && <POAMTab control={control} poam={poam} />}
              {tab === "history" && <HistoryTab control={control} />}
              {tab === "notes" && (
                <NotesTab control={control} canEdit={canEdit} onSave={patchControl} />
              )}
            </div>

            {/* Footer */}
            <footer className="border-t border-ink-700 p-4 flex items-center justify-between gap-2">
              <div className="font-mono text-[10px] tracking-widest text-bone-400">
                {saving ? "SAVING…" : canEdit ? "EDITABLE" : "READ-ONLY"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={!canEdit || saving}
                  onClick={() => {
                    const owner = prompt("New owner name:", control.owner ?? "");
                    if (owner !== null) {
                      void patchControl({
                        owner,
                        lastReviewed: new Date().toISOString().slice(0, 10)
                      });
                    }
                  }}
                  className="border border-ink-700 px-3 py-1.5 text-xs text-bone-200 hover:border-bone-300 disabled:opacity-50 disabled:hover:border-ink-700"
                >
                  Reassign owner
                </button>
                <button
                  disabled={!canEdit || saving || control.status === "Implemented"}
                  onClick={() =>
                    patchControl({
                      status: "Implemented",
                      lastReviewed: new Date().toISOString().slice(0, 10)
                    })
                  }
                  className="inline-flex items-center gap-1.5 bg-gold-300 px-4 py-1.5 text-xs font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-50 disabled:hover:bg-gold-300"
                >
                  <Check size={12} />
                  {control.status === "Implemented" ? "Implemented" : "Mark Implemented"}
                </button>
              </div>
            </footer>
          </div>
        )}
      </aside>
    </>
  );
}

/* ---------- tabs ---------- */

function Overview({
  control,
  canEdit,
  onSave
}: {
  control: Control;
  canEdit: boolean;
  onSave: (patch: Partial<Control>) => Promise<void>;
}) {
  const [status, setStatus] = useState<ControlStatus>(control.status);
  const [narrative, setNarrative] = useState(control.narrative ?? "");

  useEffect(() => {
    setStatus(control.status);
    setNarrative(control.narrative ?? "");
  }, [control.id, control.status, control.narrative]);

  const dirty = status !== control.status || narrative !== (control.narrative ?? "");

  return (
    <div className="space-y-6">
      <Section title="Requirement">
        <p className="text-sm leading-relaxed text-bone-200">{control.requirement}</p>
      </Section>

      <Section title="Implementation status">
        <div className="flex items-center gap-2">
          <select
            disabled={!canEdit}
            value={status}
            onChange={(e) => setStatus(e.target.value as ControlStatus)}
            className="border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-bone-100 focus:border-gold-300 focus:outline-none disabled:opacity-60"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Implementation narrative">
        <textarea
          disabled={!canEdit}
          rows={5}
          value={narrative}
          placeholder={canEdit ? "Author the implementation narrative used in SSP Appendix D…" : "No narrative authored yet."}
          onChange={(e) => setNarrative(e.target.value)}
          className="w-full border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none disabled:opacity-60"
        />
      </Section>

      <Section title="Assessment objectives (NIST 800-171A)">
        <ul className="space-y-2 text-sm text-bone-200">
          {["[a] objective met against authoritative artifact", "[b] objective met under examination", "[c] interview corroboration recorded"].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold-300 shrink-0" aria-hidden />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      {canEdit && (
        <div className="flex items-center justify-end gap-2 border-t border-ink-700 pt-4">
          <button
            disabled={!dirty}
            onClick={() =>
              onSave({
                status,
                narrative,
                lastReviewed: new Date().toISOString().slice(0, 10)
              })
            }
            className="inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-50 disabled:hover:bg-gold-300"
          >
            <Save size={12} /> Save overview
          </button>
        </div>
      )}
    </div>
  );
}

function EvidenceTab({
  control,
  canEdit,
  evidence,
  assessmentId,
  reviewed,
  onSaveReview,
  onCreated
}: {
  control: Control;
  canEdit: boolean;
  evidence: EvidenceItem[];
  assessmentId: string | null;
  reviewed: string[];
  onSaveReview: (next: string[]) => Promise<void>;
  onCreated: () => void;
}) {
  const catalog = getCatalogEntry(control.id);
  const [showForm, setShowForm] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const sixMonths = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
  })();
  const [form, setForm] = useState({
    name: "",
    type: "Config Export" as EvidenceItem["type"],
    fileName: "",
    system: "",
    owner: "",
    collected: today,
    expires: sixMonths,
    location: "",
    notes: ""
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!assessmentId) {
      setErr("No active assessment");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          controlIds: [control.id],
          family: control.family,
          status: "Valid",
          ...form
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setShowForm(false);
      setForm({
        name: "",
        type: "Config Export",
        fileName: "",
        system: "",
        owner: "",
        collected: today,
        expires: sixMonths,
        location: "",
        notes: ""
      });
      onCreated();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const statusFmt = (s: EvidenceItem["status"]) =>
    s === "Valid" ? "text-status-met" : s === "Expiring Soon" ? "text-status-partial" : "text-status-failed";

  return (
    <div className="space-y-5">
      {catalog && (
        <AcceptableEvidenceChecklist
          catalog={catalog}
          reviewed={reviewed}
          canEdit={canEdit}
          onSave={onSaveReview}
        />
      )}

      <Section title={`Linked artifacts (${evidence.length})`}>
        {evidence.length > 0 ? (
          <ul className="divide-y divide-ink-700 border border-ink-700">
            {evidence.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-bone-100">{e.id}</span>
                    <span className="font-mono text-[10px] text-bone-400">{e.name}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-bone-400">
                    {e.type} · {e.system} · collected {e.collected}
                    {e.expires ? ` · expires ${e.expires}` : ""}
                  </div>
                  {e.location && (
                    <a
                      href={e.location.startsWith("http") ? e.location : undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate font-mono text-[10px] text-gold-300 hover:text-gold-100"
                    >
                      {e.location}
                    </a>
                  )}
                </div>
                <span className={`font-mono text-[10px] tracking-widest2 ${statusFmt(e.status)}`}>
                  {e.status.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-bone-400">No artifacts linked yet.</p>
        )}
      </Section>

      {canEdit && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 border border-gold-300/40 bg-gold-300/5 px-3 py-2 text-xs text-gold-100 hover:bg-gold-300 hover:text-ink-950"
        >
          <Plus size={12} /> Add evidence record
        </button>
      )}

      {canEdit && showForm && (
        <form onSubmit={submit} className="space-y-3 border border-ink-700 bg-ink-950 p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            New evidence for {control.id}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldInput label="Name *"     value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <FieldSelect label="Type"      value={form.type} onChange={(v) => setForm({ ...form, type: v as EvidenceItem["type"] })} options={["Config Export", "Screenshot", "Policy Doc", "Log Sample", "Interview", "Other"]} />
            <FieldInput label="File name *" value={form.fileName} onChange={(v) => setForm({ ...form, fileName: v })} required placeholder={`${control.id}_artifact_${today}.pdf`} />
            <FieldInput label="System / tool *" value={form.system} onChange={(v) => setForm({ ...form, system: v })} required />
            <FieldInput label="Owner *"    value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} required />
            <FieldInput label="Collected *" type="date" value={form.collected} onChange={(v) => setForm({ ...form, collected: v })} required />
            <FieldInput label="Expires"    type="date" value={form.expires} onChange={(v) => setForm({ ...form, expires: v })} />
            <FieldInput label="Location (URL or path)" value={form.location} onChange={(v) => setForm({ ...form, location: v })} full />
            <FieldTextarea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} full rows={2} />
          </div>
          {err && (
            <div className="flex items-center gap-2 border border-status-failed/60 bg-status-failedBg px-3 py-2 text-xs text-status-failed">
              <AlertCircle size={12} /> {err}
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-ink-700 px-3 py-1.5 text-xs text-bone-200 hover:border-bone-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-gold-300 px-4 py-1.5 text-xs font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
            >
              <Plus size={12} /> {saving ? "Saving…" : "Create artifact"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function POAMTab({ control, poam }: { control: Control; poam: POAMItem | null }) {
  if (!poam) {
    return (
      <p className="text-sm text-bone-400">
        No POA&amp;M open against this control. Open <strong className="text-bone-200">/poam</strong> to register one.
      </p>
    );
  }
  return (
    <div className="space-y-5">
      <Section title="POA&M item">
        <div className="border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs text-gold-300">{poam.id}</span>
            <span className="font-mono text-[10px] tracking-widest2 text-status-partial">
              {poam.status.toUpperCase()}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <Field k="Risk" v={poam.risk} />
            <Field k="Owner" v={poam.owner} />
            <Field k="Opened" v={poam.opened} />
            <Field k="Closes by" v={poam.scheduledClose} />
          </div>
          <div className="mt-4 border-t border-ink-700 pt-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
              Weakness
            </div>
            <p className="mt-1 text-sm text-bone-200">{poam.weakness}</p>
          </div>
          <div className="mt-4 border-t border-ink-700 pt-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
              Remediation plan
            </div>
            <p className="mt-1 text-sm text-bone-200">{poam.remediationPlan}</p>
          </div>
        </div>
      </Section>
      <p className="text-xs text-bone-400">
        Linked control: {control.id}. Full edit + history available at <strong className="text-bone-200">/poam</strong>.
      </p>
    </div>
  );
}

function AcceptableEvidenceChecklist({
  catalog,
  reviewed,
  canEdit,
  onSave
}: {
  catalog: { cmmcLabel: string; artifacts: string[]; justification: string };
  reviewed: string[];
  canEdit: boolean;
  onSave: (next: string[]) => Promise<void>;
}) {
  const [local, setLocal] = useState<string[]>(reviewed);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLocal(reviewed);
  }, [reviewed.join("|")]);

  const dirty = local.length !== reviewed.length || local.some((x) => !reviewed.includes(x));
  const covered = local.length;
  const total = catalog.artifacts.length;
  const pct = total === 0 ? 0 : Math.round((covered / total) * 100);

  function toggle(item: string) {
    setLocal((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  }

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      await onSave(local);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border border-gold-300/30 bg-ink-950 p-4">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            ACCEPTABLE EVIDENCE · {catalog.cmmcLabel}
          </div>
          <h3 className="mt-1 text-sm text-bone-100">
            Canonical artifacts to support a passing assessment objective
          </h3>
        </div>
        <span
          className={cn(
            "font-mono text-[10px] tracking-widest2 border px-2 py-0.5",
            covered === total
              ? "border-status-met/60 text-status-met"
              : covered === 0
              ? "border-ink-600 text-bone-400"
              : "border-status-partial/60 text-status-partial"
          )}
        >
          {covered}/{total} · {pct}%
        </span>
      </header>

      <ul className="mt-3 space-y-1.5">
        {catalog.artifacts.map((artifact) => {
          const checked = local.includes(artifact);
          return (
            <li key={artifact}>
              <label
                className={cn(
                  "flex items-start gap-2 border px-3 py-2 transition",
                  checked
                    ? "border-status-met/40 bg-status-metBg/40"
                    : "border-ink-700 bg-ink-900",
                  canEdit ? "cursor-pointer hover:border-gold-300/40" : "cursor-not-allowed opacity-90"
                )}
              >
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={checked}
                  onChange={() => toggle(artifact)}
                  className="mt-0.5 h-3.5 w-3.5 accent-gold-300"
                />
                <span className="text-sm text-bone-100">{artifact}</span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 border-t border-ink-700 pt-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
          Why these artifacts are sufficient
        </div>
        <p className="mt-1 text-sm leading-snug text-bone-200">{catalog.justification}</p>
      </div>

      {err && (
        <div className="mt-3 flex items-center gap-2 border border-status-failed/60 bg-status-failedBg px-3 py-2 text-xs text-status-failed">
          <AlertCircle size={12} /> {err}
        </div>
      )}
      {canEdit && (
        <div className="mt-3 flex items-center justify-end">
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 bg-gold-300 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-50 disabled:hover:bg-gold-300"
          >
            <Save size={11} /> {saving ? "Saving…" : "Save review"}
          </button>
        </div>
      )}
    </section>
  );
}

function HistoryTab({ control }: { control: Control }) {
  const items: Array<{ d: string; who: string; what: string }> = [];
  if (control.lastReviewed) {
    items.push({
      d: control.lastReviewed,
      who: control.owner ?? "system",
      what: `Status: ${control.status}`
    });
  }
  if (items.length === 0) {
    return <p className="text-sm text-bone-400">No edits recorded for this assessment yet.</p>;
  }
  return (
    <ol className="relative border-l border-ink-700">
      {items.map((i, idx) => (
        <li key={idx} className="relative mb-5 pl-5">
          <span className="absolute -left-[5px] top-1.5 h-2 w-2 rotate-45 border border-gold-300 bg-ink-900" aria-hidden />
          <div className="font-mono text-[10px] tracking-widest2 text-bone-400">{i.d} · {i.who.toUpperCase()}</div>
          <div className="mt-1 text-sm text-bone-100">{i.what}</div>
        </li>
      ))}
    </ol>
  );
}

function NotesTab({
  control,
  canEdit,
  onSave
}: {
  control: Control;
  canEdit: boolean;
  onSave: (patch: Partial<Control>) => Promise<void>;
}) {
  // Assessor notes live on the override record. We surface them via the control
  // narrative field for now and add a separate assessorNotes field on save.
  const [draft, setDraft] = useState("");

  async function append() {
    if (!draft.trim()) return;
    // Patch flow: stick the note in the narrative with a timestamp prefix so
    // it's preserved on the SSP-D export, and clear the input.
    const stamp = new Date().toISOString().slice(0, 10);
    const existing = control.narrative ?? "";
    const next = existing
      ? `${existing}\n\n[Note ${stamp}] ${draft.trim()}`
      : `[Note ${stamp}] ${draft.trim()}`;
    await onSave({ narrative: next });
    setDraft("");
  }

  return (
    <div className="space-y-4">
      {control.narrative ? (
        <div className="border border-ink-700 bg-ink-950 p-4">
          <div className="font-mono text-[10px] tracking-widest2 text-bone-400">CURRENT NARRATIVE / NOTES</div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-bone-200">{control.narrative}</p>
        </div>
      ) : (
        <p className="text-sm text-bone-400">No notes yet.</p>
      )}

      {canEdit ? (
        <>
          <textarea
            rows={3}
            value={draft}
            placeholder="Append an assessor note…"
            onChange={(e) => setDraft(e.target.value)}
            className="w-full border border-ink-700 bg-ink-950 p-3 text-sm text-bone-100 placeholder:text-bone-400 focus:border-gold-300 focus:outline-none"
          />
          <button
            disabled={!draft.trim()}
            onClick={() => void append()}
            className="bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
          >
            Append note →
          </button>
        </>
      ) : (
        <p className="font-mono text-[10px] tracking-widest text-bone-400">
          ADMIN REQUIRED TO APPEND.
        </p>
      )}
    </div>
  );
}

/* ---------- form primitives ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{k}</div>
      <div className="mt-1 text-bone-100">{v}</div>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  full = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "date" | "number";
  placeholder?: string;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={full ? "sm:col-span-2" : undefined}>
      <span className="text-[11px] uppercase tracking-widest text-bone-400">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
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

function FieldSelect({
  label,
  value,
  onChange,
  options,
  full = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  full?: boolean;
}) {
  return (
    <label className={full ? "sm:col-span-2" : undefined}>
      <span className="text-[11px] uppercase tracking-widest text-bone-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-bone-100 focus:border-gold-300 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
