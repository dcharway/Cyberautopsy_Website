"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Calendar,
  User,
  AlertCircle,
  Pencil,
  Archive,
  History as HistoryIcon,
  X,
  Save
} from "lucide-react";
import Link from "next/link";
import type { POAMItem } from "@/lib/poam-store";
import type { Client } from "@/lib/clients";
import type { Assessment } from "@/lib/assessments";
import { cn } from "@/lib/utils";

type Status = POAMItem["status"];
type Risk = POAMItem["risk"];

const COLUMNS: { key: Status; label: string; tone: string }[] = [
  { key: "Open",            label: "Open",             tone: "border-status-failed/50" },
  { key: "In Remediation",  label: "In Remediation",   tone: "border-status-partial/50" },
  { key: "Pending Review",  label: "Pending Review",   tone: "border-status-review/50" },
  { key: "Closed",          label: "Closed",           tone: "border-status-met/50" }
];

const RISK_STYLE: Record<Risk, string> = {
  High:   "border-status-failed/60 text-status-failed",
  Medium: "border-status-partial/60 text-status-partial",
  Low:    "border-status-met/60 text-status-met"
};

type Props = {
  client: Client | null;
  assessment: Assessment | null;
  initialItems: POAMItem[];
};

export function POAMWorkspace({ client, assessment, initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [newOpen, setNewOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<POAMItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function patchItem(id: string, updates: Partial<POAMItem>, note?: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/poam/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updates, note })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setItems((prev) => prev.map((i) => (i.id === id ? data.item : i)));
      if (drawerItem?.id === id) setDrawerItem(data.item);
      refresh();
      return data.item as POAMItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      throw err;
    }
  }

  async function archiveItem(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/poam/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed");
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (drawerItem?.id === id) setDrawerItem(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  const byColumn: Record<Status, POAMItem[]> = {
    Open: [],
    "In Remediation": [],
    "Pending Review": [],
    Closed: []
  };
  items.forEach((p) => byColumn[p.status].push(p));

  const counts = useMemo(
    () => ({
      open: byColumn.Open.length,
      inRem: byColumn["In Remediation"].length,
      review: byColumn["Pending Review"].length,
      closed: byColumn.Closed.length
    }),
    [byColumn]
  );

  // No active assessment — guide user to clients page
  if (!client || !assessment) {
    return (
      <div className="space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            PLAN OF ACTION &amp; MILESTONES
          </div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            No active assessment.
          </h1>
        </header>
        <section className="border border-gold-300/40 bg-ink-900 p-8 shadow-gilt text-center">
          <p className="text-sm text-bone-200">
            Register a client and scope an assessment first, then come back here to track POA&amp;Ms.
          </p>
          <Link
            href="/admin/clients"
            className="mt-4 inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200"
          >
            Open clients workspace →
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            PLAN OF ACTION &amp; MILESTONES
          </div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            POA&amp;M workflow.
          </h1>
          <p className="mt-2 text-xs text-bone-400">
            {client.organization} · {assessment.reportingPeriod} · {assessment.assessor}
          </p>
        </div>
        <button
          onClick={() => setNewOpen(true)}
          className="inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200"
        >
          <Plus size={13} /> New POA&amp;M
        </button>
      </header>

      {error && (
        <div className="flex items-center gap-2 border border-status-failed/60 bg-status-failedBg px-4 py-3 text-xs text-status-failed">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Open"               value={counts.open}   accent="text-status-failed" />
        <Kpi label="In Remediation"     value={counts.inRem}  accent="text-status-partial" />
        <Kpi label="Pending Review"     value={counts.review} accent="text-status-review" />
        <Kpi label="Closed (this cycle)" value={counts.closed} accent="text-status-met" />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((col) => (
          <section
            key={col.key}
            className={cn("flex flex-col rounded-sm border bg-ink-900", col.tone)}
          >
            <header className="flex items-center justify-between border-b border-ink-700 p-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-bone-100">
                  {col.label}
                </span>
                <span className="font-mono text-[10px] text-bone-400 border border-ink-700 px-1.5 py-0.5">
                  {byColumn[col.key].length}
                </span>
              </div>
            </header>
            <ul className="flex-1 space-y-2 p-3 min-h-[200px]">
              {byColumn[col.key].map((p) => (
                <li key={p.id}>
                  <Card item={p} onOpen={() => setDrawerItem(p)} onMove={(to) => patchItem(p.id, { status: to }, `Moved to ${to}`)} />
                </li>
              ))}
              {byColumn[col.key].length === 0 && (
                <li className="text-center text-[11px] text-bone-500 py-8">No items</li>
              )}
            </ul>
          </section>
        ))}
      </div>

      <p className="text-xs text-bone-400">
        {items.length} POA&amp;Ms total in this assessment. Edits are timestamped per item; open
        any card to view its full history.
      </p>

      {newOpen && (
        <NewPOAMDialog
          assessmentId={assessment.id}
          onClose={() => setNewOpen(false)}
          onCreated={(item) => {
            setItems((prev) => [...prev, item]);
            setNewOpen(false);
            refresh();
          }}
        />
      )}

      {drawerItem && (
        <POAMDrawer
          item={drawerItem}
          onClose={() => setDrawerItem(null)}
          onSave={(updates, note) => patchItem(drawerItem.id, updates, note)}
          onArchive={() => archiveItem(drawerItem.id)}
        />
      )}
    </div>
  );
}

/* ---------- KPI + Card ---------- */

function Kpi({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="border border-ink-700 bg-ink-900 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{label}</div>
      <div className={`mt-2 font-serif text-3xl ${accent}`}>{value}</div>
    </div>
  );
}

function Card({
  item,
  onOpen,
  onMove
}: {
  item: POAMItem;
  onOpen: () => void;
  onMove: (to: Status) => void;
}) {
  const closeDate = new Date(item.scheduledClose);
  const daysToClose = Math.ceil((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const overdue = daysToClose < 0;
  const dueSoon = daysToClose >= 0 && daysToClose < 14;

  const nextCol: Record<Status, Status | null> = {
    Open: "In Remediation",
    "In Remediation": "Pending Review",
    "Pending Review": "Closed",
    Closed: null
  };
  const prevCol: Record<Status, Status | null> = {
    Open: null,
    "In Remediation": "Open",
    "Pending Review": "In Remediation",
    Closed: "Pending Review"
  };

  return (
    <article className="border border-ink-700 bg-ink-950 p-3 hover:border-gold-300/40 transition">
      <div className="flex items-baseline justify-between">
        <button onClick={onOpen} className="font-mono text-[10px] tracking-widest2 text-gold-300 hover:text-gold-100">
          {item.id}
        </button>
        <span className={cn("border px-1.5 py-0.5 font-mono text-[9px] tracking-widest2", RISK_STYLE[item.risk])}>
          {item.risk.toUpperCase()}
        </span>
      </div>

      <div className="mt-2 font-mono text-[11px] text-bone-100">CONTROL · {item.controlId}</div>
      <p className="mt-2 line-clamp-3 text-xs text-bone-200">{item.weakness}</p>

      <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-bone-400">
        <span className="flex items-center gap-1">
          <User size={11} /> {item.owner}
        </span>
        <span
          className={cn(
            "flex items-center gap-1",
            overdue ? "text-status-failed" : dueSoon ? "text-status-partial" : "text-bone-400"
          )}
        >
          {overdue && <AlertCircle size={11} />}
          <Calendar size={11} /> {item.scheduledClose}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-700 pt-2">
        <button
          disabled={prevCol[item.status] === null}
          onClick={() => prevCol[item.status] && onMove(prevCol[item.status] as Status)}
          className="font-mono text-[10px] tracking-widest2 text-bone-400 hover:text-bone-100 disabled:opacity-40 disabled:hover:text-bone-400"
        >
          ← BACK
        </button>
        <button
          onClick={onOpen}
          className="font-mono text-[10px] tracking-widest2 text-gold-300 hover:text-gold-100"
        >
          EDIT
        </button>
        <button
          disabled={nextCol[item.status] === null}
          onClick={() => nextCol[item.status] && onMove(nextCol[item.status] as Status)}
          className="font-mono text-[10px] tracking-widest2 text-gold-300 hover:text-gold-100 disabled:opacity-40 disabled:hover:text-gold-300"
        >
          ADVANCE →
        </button>
      </div>
    </article>
  );
}

/* ---------- New POA&M dialog ---------- */

function NewPOAMDialog({
  assessmentId,
  onClose,
  onCreated
}: {
  assessmentId: string;
  onClose: () => void;
  onCreated: (item: POAMItem) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const sixtyDays = new Date(Date.now() + 60 * 86400 * 1000).toISOString().slice(0, 10);
  const [form, setForm] = useState({
    controlId: "",
    weakness: "",
    risk: "Medium" as Risk,
    remediationPlan: "",
    scheduledClose: sixtyDays,
    status: "Open" as Status,
    owner: "",
    opened: today,
    comments: ""
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/poam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, ...form })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      onCreated(data.item);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New POA&M item" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldInput label="Control ID *"     value={form.controlId} onChange={(v) => setForm({ ...form, controlId: v })} placeholder="3.1.5" required />
          <FieldSelect label="Risk"            value={form.risk} onChange={(v) => setForm({ ...form, risk: v as Risk })} options={["Low", "Medium", "High"]} />
          <FieldSelect label="Status"          value={form.status} onChange={(v) => setForm({ ...form, status: v as Status })} options={["Open", "In Remediation", "Pending Review", "Closed"]} />
          <FieldInput  label="Owner *"         value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} required />
          <FieldInput  label="Opened *"        type="date" value={form.opened} onChange={(v) => setForm({ ...form, opened: v })} required />
          <FieldInput  label="Scheduled close *" type="date" value={form.scheduledClose} onChange={(v) => setForm({ ...form, scheduledClose: v })} required />
          <FieldTextarea label="Weakness / deficiency *" value={form.weakness} onChange={(v) => setForm({ ...form, weakness: v })} rows={3} required full />
          <FieldTextarea label="Remediation plan *"      value={form.remediationPlan} onChange={(v) => setForm({ ...form, remediationPlan: v })} rows={3} required full />
          <FieldTextarea label="Comments"                value={form.comments} onChange={(v) => setForm({ ...form, comments: v })} rows={2} full />
        </div>
        {err && (
          <div className="flex items-center gap-2 border border-status-failed/60 bg-status-failedBg px-3 py-2 text-xs text-status-failed">
            <AlertCircle size={12} /> {err}
          </div>
        )}
        <ModalActions onClose={onClose}>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
          >
            <Plus size={12} /> {saving ? "Creating…" : "Create POA&M"}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}

/* ---------- POA&M drawer (edit + history) ---------- */

function POAMDrawer({
  item,
  onClose,
  onSave,
  onArchive
}: {
  item: POAMItem;
  onClose: () => void;
  onSave: (updates: Partial<POAMItem>, note?: string) => Promise<POAMItem>;
  onArchive: () => void;
}) {
  const [form, setForm] = useState({
    weakness: item.weakness,
    risk: item.risk,
    remediationPlan: item.remediationPlan,
    scheduledClose: item.scheduledClose,
    status: item.status,
    owner: item.owner,
    comments: item.comments ?? "",
    note: ""
  });
  const [tab, setTab] = useState<"edit" | "history">("edit");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const { note, ...rest } = form;
      await onSave(rest, note || undefined);
      setForm((f) => ({ ...f, note: "" }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-ink-950/80 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-2xl flex-col border-l border-gold-300/40 bg-ink-900 shadow-gilt">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-ink-700 px-6 py-4">
          <div>
            <div className="font-mono text-[10px] tracking-widest2 text-gold-300">
              {item.id} · CONTROL {item.controlId}
            </div>
            <h2 className="mt-1 font-serif text-2xl text-bone-50">POA&amp;M detail</h2>
          </div>
          <button onClick={onClose} className="text-bone-400 hover:text-bone-100">
            <X size={18} />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-ink-700 px-6">
          <TabButton active={tab === "edit"} onClick={() => setTab("edit")} icon={<Pencil size={12} />}>Edit</TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")} icon={<HistoryIcon size={12} />}>
            History ({item.history.length})
          </TabButton>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "edit" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
              className="space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldSelect label="Status"             value={form.status} onChange={(v) => setForm({ ...form, status: v as Status })} options={["Open", "In Remediation", "Pending Review", "Closed"]} />
                <FieldSelect label="Risk"               value={form.risk} onChange={(v) => setForm({ ...form, risk: v as Risk })} options={["Low", "Medium", "High"]} />
                <FieldInput  label="Owner"              value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} />
                <FieldInput  label="Scheduled close"    type="date" value={form.scheduledClose} onChange={(v) => setForm({ ...form, scheduledClose: v })} />
                <FieldTextarea label="Weakness"          value={form.weakness} onChange={(v) => setForm({ ...form, weakness: v })} rows={3} full />
                <FieldTextarea label="Remediation plan"  value={form.remediationPlan} onChange={(v) => setForm({ ...form, remediationPlan: v })} rows={3} full />
                <FieldTextarea label="Comments"          value={form.comments} onChange={(v) => setForm({ ...form, comments: v })} rows={3} full />
                <FieldTextarea label="Change note (optional)" value={form.note} onChange={(v) => setForm({ ...form, note: v })} rows={2} full placeholder="Why is this being changed?" />
              </div>
              {err && (
                <div className="flex items-center gap-2 border border-status-failed/60 bg-status-failedBg px-3 py-2 text-xs text-status-failed">
                  <AlertCircle size={12} /> {err}
                </div>
              )}
              <div className="flex items-center justify-between border-t border-ink-700 pt-4">
                <button
                  type="button"
                  onClick={onArchive}
                  className="inline-flex items-center gap-1.5 border border-ink-700 px-3 py-1.5 text-xs text-bone-300 hover:border-status-failed/60 hover:text-status-failed"
                >
                  <Archive size={12} /> Archive item
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
                >
                  <Save size={12} /> {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <ol className="space-y-3">
              {[...item.history].reverse().map((h, idx) => (
                <li key={idx} className="border border-ink-700 bg-ink-950 p-4">
                  <div className="flex items-baseline justify-between font-mono text-[10px] tracking-widest text-bone-400">
                    <span>{new Date(h.at).toLocaleString("en-US")}</span>
                    <span className="text-gold-300">{h.by}</span>
                  </div>
                  {h.note && <p className="mt-1 text-xs italic text-bone-300">"{h.note}"</p>}
                  <ul className="mt-2 space-y-1">
                    {h.changes.map((c, i) => (
                      <li key={i} className="text-xs text-bone-200">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-gold-300">{c.field}</span>{" "}
                        <span className="text-bone-400">{formatChange(c.from)} → </span>
                        <span className="text-bone-100">{formatChange(c.to)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              {item.history.length === 0 && (
                <li className="text-center text-xs text-bone-400 py-8">No history yet.</li>
              )}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

function formatChange(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return `[${v.length} item${v.length === 1 ? "" : "s"}]`;
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function TabButton({
  active,
  onClick,
  icon,
  children
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 border-b-2 px-3 py-3 font-mono text-[11px] tracking-widest2",
        active
          ? "border-gold-300 text-gold-200"
          : "border-transparent text-bone-400 hover:text-bone-100"
      )}
    >
      {icon} {children}
    </button>
  );
}

/* ---------- Modal + form primitives (kept local to avoid shared dependency) ---------- */

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gold-300/40 bg-ink-900 shadow-gilt">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-700 bg-ink-900 px-6 py-4">
          <h2 className="font-serif text-xl text-bone-50">{title}</h2>
          <button onClick={onClose} className="text-bone-400 hover:text-bone-100">
            <X size={16} />
          </button>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-ink-700 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="border border-ink-700 px-4 py-2 text-xs text-bone-200 hover:border-bone-300"
      >
        Cancel
      </button>
      {children}
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
  required = false,
  full = false,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
  full?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={full ? "sm:col-span-2" : undefined}>
      <span className="text-[11px] uppercase tracking-widest text-bone-400">{label}</span>
      <textarea
        value={value}
        required={required}
        rows={rows}
        placeholder={placeholder}
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
