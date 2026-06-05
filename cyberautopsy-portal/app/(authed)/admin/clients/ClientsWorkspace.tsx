"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Check,
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronRight,
  Calendar,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  X
} from "lucide-react";
import type { Client } from "@/lib/clients";
import type { Assessment } from "@/lib/assessments";

type ActiveRef = { clientId: string | null; assessmentId: string | null };

type Props = {
  initialClients: Client[];
  initialAssessments: Assessment[];
  initialActive: ActiveRef;
};

export function ClientsWorkspace({ initialClients, initialAssessments, initialActive }: Props) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [assessments, setAssessments] = useState(initialAssessments);
  const [active, setActive] = useState(initialActive);
  const [openClientId, setOpenClientId] = useState<string | null>(initialActive.clientId);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newAssessmentForClientId, setNewAssessmentForClientId] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<{ client: Client; assessment: Assessment } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function setActiveClient(clientId: string | null, assessmentId: string | null) {
    setError(null);
    try {
      const res = await fetch("/api/admin/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, assessmentId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to set active");
      setActive(data.ref);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set active");
    }
  }

  async function archiveClient(id: string, unarchive = false) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${id}${unarchive ? "?unarchive=1" : ""}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed");
      }
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, archived: !unarchive } : c)));
      if (!unarchive && active.clientId === id) {
        await setActiveClient(null, null);
      }
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function archiveAssessment(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/assessments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed");
      }
      setAssessments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Archived" as const } : a))
      );
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  const assessmentsByClient = useMemo(() => {
    const m = new Map<string, Assessment[]>();
    for (const a of assessments) {
      const arr = m.get(a.clientId) ?? [];
      arr.push(a);
      m.set(a.clientId, arr);
    }
    return m;
  }, [assessments]);

  const activeClient = clients.find((c) => c.id === active.clientId);
  const activeAssessment = assessments.find((a) => a.id === active.assessmentId);

  return (
    <div className="space-y-6">
      {/* Active context banner */}
      <section className="flex flex-wrap items-center gap-4 border border-gold-300/40 bg-ink-900 px-5 py-4 shadow-gilt">
        <ShieldCheck className="text-gold-300" size={18} />
        <div className="flex-1 min-w-[260px]">
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">ACTIVE ENGAGEMENT</div>
          {activeClient && activeAssessment ? (
            <div className="mt-1">
              <div className="text-sm text-bone-50">{activeClient.organizationLegal}</div>
              <div className="font-mono text-[11px] text-bone-400">
                {activeAssessment.reportingPeriod} · CAGE {activeClient.cage} · {activeAssessment.assessor}
              </div>
            </div>
          ) : (
            <div className="mt-1 text-sm text-bone-400">No active engagement. Pick a client + assessment below.</div>
          )}
        </div>
        {activeClient && (
          <button
            onClick={() => setActiveClient(null, null)}
            className="inline-flex items-center gap-1.5 border border-ink-700 px-3 py-1.5 text-xs text-bone-300 hover:border-status-failed/60 hover:text-status-failed"
          >
            <X size={12} /> Clear active
          </button>
        )}
      </section>

      {error && (
        <div className="flex items-center gap-2 border border-status-failed/60 bg-status-failedBg px-4 py-3 text-xs text-status-failed">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Header + New client button */}
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
          {clients.filter((c) => !c.archived).length} active · {clients.filter((c) => c.archived).length} archived
        </div>
        <button
          onClick={() => setShowNewClient(true)}
          className="inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200"
        >
          <Plus size={13} /> Register client
        </button>
      </div>

      {/* Client list */}
      <ul className="space-y-3">
        {clients.map((client) => {
          const isOpen = openClientId === client.id;
          const isActive = active.clientId === client.id;
          const clientAssessments = assessmentsByClient.get(client.id) ?? [];
          return (
            <li
              key={client.id}
              className={
                isActive
                  ? "border border-gold-300/50 bg-ink-900 shadow-gilt"
                  : client.archived
                  ? "border border-ink-700/50 bg-ink-900/60 opacity-70"
                  : "border border-ink-700 bg-ink-900"
              }
            >
              <button
                onClick={() => setOpenClientId(isOpen ? null : client.id)}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <span className="flex h-10 w-10 items-center justify-center border border-gold-300/40 bg-gold-300/5 text-gold-300">
                  <Building2 size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg text-bone-50 truncate">{client.organization}</h2>
                    {isActive && (
                      <span className="border border-gold-300/60 bg-gold-300/10 px-1.5 py-0.5 font-mono text-[9px] tracking-widest2 text-gold-200">
                        ACTIVE
                      </span>
                    )}
                    {client.archived && (
                      <span className="border border-ink-700 px-1.5 py-0.5 font-mono text-[9px] tracking-widest2 text-bone-400">
                        ARCHIVED
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-bone-400">
                    CAGE {client.cage} · {client.systemBoundary} ·{" "}
                    {clientAssessments.length} assessment{clientAssessments.length === 1 ? "" : "s"}
                  </div>
                </div>
                {isOpen ? (
                  <ChevronDown size={16} className="text-bone-400" />
                ) : (
                  <ChevronRight size={16} className="text-bone-400" />
                )}
              </button>

              {isOpen && (
                <div className="space-y-4 border-t border-ink-700 px-5 py-5">
                  {/* Client metadata */}
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <Detail k="Legal name" v={client.organizationLegal} />
                    <Detail k="DUNS" v={client.duns ?? "—"} />
                    <Detail k="RPO firm" v={client.rpoFirm} />
                    <Detail k="C3PAO of record" v={client.c3paoFirm} />
                    <Detail k="Affirming officer" v={`${client.affirmingOfficial} · ${client.affirmingOfficialTitle}`} />
                    {client.primaryContact && (
                      <Detail
                        k="Primary contact"
                        v={`${client.primaryContact.name} · ${client.primaryContact.email}`}
                      />
                    )}
                  </dl>

                  {/* Assessment list */}
                  <div className="border-t border-ink-700 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">ASSESSMENTS</div>
                      <button
                        onClick={() => setNewAssessmentForClientId(client.id)}
                        disabled={client.archived}
                        className="inline-flex items-center gap-1.5 border border-gold-300/40 bg-gold-300/5 px-3 py-1.5 text-xs text-gold-100 hover:bg-gold-300 hover:text-ink-950 disabled:opacity-50 disabled:hover:bg-gold-300/5 disabled:hover:text-gold-100"
                      >
                        <Plus size={11} /> New assessment
                      </button>
                    </div>
                    {clientAssessments.length === 0 ? (
                      <p className="mt-3 text-xs text-bone-400">No assessments yet for this client.</p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {clientAssessments.map((a) => {
                          const isActiveA = active.assessmentId === a.id;
                          return (
                            <li
                              key={a.id}
                              className={
                                isActiveA
                                  ? "flex items-center gap-3 border border-gold-300/40 bg-gold-300/5 px-4 py-3"
                                  : "flex items-center gap-3 border border-ink-700 bg-ink-950 px-4 py-3"
                              }
                            >
                              <Calendar size={14} className="text-gold-300" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-bone-100">{a.reportingPeriod}</span>
                                  <StatusChip status={a.status} />
                                  {isActiveA && (
                                    <span className="border border-gold-300/60 bg-gold-300/10 px-1.5 py-0.5 font-mono text-[9px] tracking-widest2 text-gold-200">
                                      ACTIVE
                                    </span>
                                  )}
                                </div>
                                <div className="mt-0.5 font-mono text-[10px] text-bone-400">
                                  {a.engagementStart} → {a.scheduledClose} · {a.assessor} · {a.documentVersion}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!isActiveA && a.status !== "Archived" && (
                                  <button
                                    onClick={() => setActiveClient(client.id, a.id)}
                                    className="inline-flex items-center gap-1 border border-gold-300/40 bg-gold-300/10 px-2.5 py-1 font-mono text-[10px] tracking-widest text-gold-200 hover:bg-gold-300 hover:text-ink-950"
                                  >
                                    <Check size={10} /> SET ACTIVE
                                  </button>
                                )}
                                {a.status !== "Archived" && (
                                  <button
                                    onClick={() => setResetTarget({ client, assessment: a })}
                                    title="Reset assessment to a clean baseline"
                                    className="text-bone-400 hover:text-status-partial"
                                  >
                                    <RotateCcw size={13} />
                                  </button>
                                )}
                                {a.status !== "Archived" && (
                                  <button
                                    onClick={() => archiveAssessment(a.id)}
                                    title="Archive"
                                    className="text-bone-400 hover:text-status-failed"
                                  >
                                    <Archive size={13} />
                                  </button>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Client actions */}
                  <div className="flex items-center justify-end gap-2 border-t border-ink-700 pt-4">
                    {client.archived ? (
                      <button
                        onClick={() => archiveClient(client.id, true)}
                        className="inline-flex items-center gap-1.5 border border-ink-700 px-3 py-1.5 text-xs text-bone-300 hover:border-gold-300/60 hover:text-gold-200"
                      >
                        <ArchiveRestore size={12} /> Unarchive
                      </button>
                    ) : (
                      <button
                        onClick={() => archiveClient(client.id)}
                        className="inline-flex items-center gap-1.5 border border-ink-700 px-3 py-1.5 text-xs text-bone-300 hover:border-status-failed/60 hover:text-status-failed"
                      >
                        <Archive size={12} /> Archive client
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {showNewClient && (
        <NewClientDialog
          onClose={() => setShowNewClient(false)}
          onCreated={(client) => {
            setClients((prev) => [...prev, client]);
            setOpenClientId(client.id);
            setShowNewClient(false);
            refresh();
          }}
        />
      )}

      {newAssessmentForClientId && (
        <NewAssessmentDialog
          client={clients.find((c) => c.id === newAssessmentForClientId)!}
          onClose={() => setNewAssessmentForClientId(null)}
          onCreated={(assessment) => {
            setAssessments((prev) => [assessment, ...prev]);
            setNewAssessmentForClientId(null);
            // Auto-activate the new assessment
            void setActiveClient(assessment.clientId, assessment.id);
          }}
        />
      )}

      {resetTarget && (
        <ResetAssessmentDialog
          client={resetTarget.client}
          assessment={resetTarget.assessment}
          onClose={() => setResetTarget(null)}
          onComplete={() => {
            setResetTarget(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

/* ---------- subcomponents ---------- */

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{k}</dt>
      <dd className="mt-0.5 text-sm text-bone-100">{v}</dd>
    </div>
  );
}

function StatusChip({ status }: { status: Assessment["status"] }) {
  const style =
    status === "Active"
      ? "border-status-met/60 bg-status-metBg text-status-met"
      : status === "Closed"
      ? "border-status-review/60 bg-status-reviewBg text-status-review"
      : "border-ink-600 text-bone-400";
  return (
    <span className={`border px-1.5 py-0.5 font-mono text-[9px] tracking-widest2 ${style}`}>
      {status.toUpperCase()}
    </span>
  );
}

/* ---------- New Client dialog ---------- */

function NewClientDialog({
  onClose,
  onCreated
}: {
  onClose: () => void;
  onCreated: (c: Client) => void;
}) {
  const [form, setForm] = useState({
    organization: "",
    organizationLegal: "",
    cage: "",
    duns: "",
    systemBoundary: "CUI Enclave — Primary",
    rpoFirm: "CyberAutopsy LLC",
    c3paoFirm: "",
    affirmingOfficial: "",
    affirmingOfficialTitle: "Chief Executive Officer",
    affirmingOfficialEmail: "",
    contactName: "",
    contactEmail: "",
    contactTitle: ""
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const payload: Record<string, unknown> = {
        organization: form.organization,
        organizationLegal: form.organizationLegal || form.organization,
        cage: form.cage,
        duns: form.duns || undefined,
        systemBoundary: form.systemBoundary,
        rpoFirm: form.rpoFirm,
        c3paoFirm: form.c3paoFirm,
        affirmingOfficial: form.affirmingOfficial,
        affirmingOfficialTitle: form.affirmingOfficialTitle,
        affirmingOfficialEmail: form.affirmingOfficialEmail || undefined
      };
      if (form.contactName || form.contactEmail) {
        payload.primaryContact = {
          name: form.contactName,
          email: form.contactEmail,
          title: form.contactTitle
        };
      }
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      onCreated(data.client);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title="Register a new client" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <Section title="Identity">
          <Grid>
            <Field label="Organization (display) *" value={form.organization} onChange={(v) => setForm({ ...form, organization: v })} required />
            <Field label="Organization (legal)"     value={form.organizationLegal} onChange={(v) => setForm({ ...form, organizationLegal: v })} />
            <Field label="CAGE code *"              value={form.cage} onChange={(v) => setForm({ ...form, cage: v })} required />
            <Field label="DUNS"                     value={form.duns} onChange={(v) => setForm({ ...form, duns: v })} />
            <Field label="System boundary *"        value={form.systemBoundary} onChange={(v) => setForm({ ...form, systemBoundary: v })} required full />
          </Grid>
        </Section>
        <Section title="Engagement parties">
          <Grid>
            <Field label="RPO firm"           value={form.rpoFirm} onChange={(v) => setForm({ ...form, rpoFirm: v })} />
            <Field label="C3PAO of record"    value={form.c3paoFirm} onChange={(v) => setForm({ ...form, c3paoFirm: v })} />
          </Grid>
        </Section>
        <Section title="Annual affirming officer">
          <Grid>
            <Field label="Name"  value={form.affirmingOfficial} onChange={(v) => setForm({ ...form, affirmingOfficial: v })} />
            <Field label="Title" value={form.affirmingOfficialTitle} onChange={(v) => setForm({ ...form, affirmingOfficialTitle: v })} />
            <Field label="Email" value={form.affirmingOfficialEmail} onChange={(v) => setForm({ ...form, affirmingOfficialEmail: v })} type="email" />
          </Grid>
        </Section>
        <Section title="Primary contact (optional)">
          <Grid>
            <Field label="Name"  value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
            <Field label="Email" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} type="email" />
            <Field label="Title" value={form.contactTitle} onChange={(v) => setForm({ ...form, contactTitle: v })} />
          </Grid>
        </Section>

        {err && (
          <div className="flex items-center gap-2 border border-status-failed/60 bg-status-failedBg px-3 py-2 text-xs text-status-failed">
            <AlertCircle size={12} /> {err}
          </div>
        )}
        <DialogActions onClose={onClose}>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Register client"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

/* ---------- New Assessment dialog ---------- */

function NewAssessmentDialog({
  client,
  onClose,
  onCreated
}: {
  client: Client;
  onClose: () => void;
  onCreated: (a: Assessment) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const oneYear = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  })();
  const [form, setForm] = useState({
    reportingPeriod: `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`,
    engagementStart: today,
    scheduledClose: "",
    assessor: client.affirmingOfficial || "",
    documentVersion: "v1.0",
    classification: "Controlled Unclassified Information (CUI)",
    affirmingOfficial: client.affirmingOfficial,
    affirmingOfficialTitle: client.affirmingOfficialTitle,
    affirmingOfficialEmail: client.affirmingOfficialEmail ?? "",
    lastAffirmation: "",
    nextAffirmationDue: oneYear,
    notes: ""
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id, ...form, lastAffirmation: form.lastAffirmation || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      onCreated(data.assessment);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title={`New assessment — ${client.organization}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <Section title="Scope & timeline">
          <Grid>
            <Field label="Reporting period *" value={form.reportingPeriod} onChange={(v) => setForm({ ...form, reportingPeriod: v })} required />
            <Field label="Lead assessor *"    value={form.assessor} onChange={(v) => setForm({ ...form, assessor: v })} required />
            <Field label="Engagement start *" type="date" value={form.engagementStart} onChange={(v) => setForm({ ...form, engagementStart: v })} required />
            <Field label="Audit-ready target *" type="date" value={form.scheduledClose} onChange={(v) => setForm({ ...form, scheduledClose: v })} required />
          </Grid>
        </Section>
        <Section title="Document defaults">
          <Grid>
            <Field label="Document version"  value={form.documentVersion} onChange={(v) => setForm({ ...form, documentVersion: v })} />
            <Field label="Classification"    value={form.classification} onChange={(v) => setForm({ ...form, classification: v })} full />
          </Grid>
        </Section>
        <Section title="Affirmation snapshot">
          <Grid>
            <Field label="Affirming officer"   value={form.affirmingOfficial} onChange={(v) => setForm({ ...form, affirmingOfficial: v })} />
            <Field label="Title"               value={form.affirmingOfficialTitle} onChange={(v) => setForm({ ...form, affirmingOfficialTitle: v })} />
            <Field label="Last affirmation"    type="date" value={form.lastAffirmation} onChange={(v) => setForm({ ...form, lastAffirmation: v })} />
            <Field label="Next affirmation *"  type="date" value={form.nextAffirmationDue} onChange={(v) => setForm({ ...form, nextAffirmationDue: v })} required />
          </Grid>
        </Section>

        {err && (
          <div className="flex items-center gap-2 border border-status-failed/60 bg-status-failedBg px-3 py-2 text-xs text-status-failed">
            <AlertCircle size={12} /> {err}
          </div>
        )}
        <DialogActions onClose={onClose}>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create + set active"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

/* ---------- Reset assessment dialog ---------- */

function ResetAssessmentDialog({
  client,
  assessment,
  onClose,
  onComplete
}: {
  client: Client;
  assessment: Assessment;
  onClose: () => void;
  onComplete: () => void;
}) {
  const confirmPhrase = `RESET ${assessment.reportingPeriod}`;
  const [typed, setTyped] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const phraseMatches = typed.trim() === confirmPhrase;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!phraseMatches) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/assessments/${assessment.id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: assessment.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      onComplete();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Reset failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog title="Reset assessment to clean baseline" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="border border-status-failed/40 bg-status-failedBg/30 p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-status-failed">
            DESTRUCTIVE ACTION
          </div>
          <p className="mt-2 text-sm text-bone-100">
            This wipes every data input recorded against{" "}
            <strong className="text-bone-50">{client.organization} · {assessment.reportingPeriod}</strong>{" "}
            and returns it to a clean baseline.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-ink-700 bg-ink-950 p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-status-failed">
              WILL BE WIPED
            </div>
            <ul className="mt-2 list-disc pl-4 text-xs text-bone-200 space-y-1">
              <li>All POA&amp;M items + their edit history</li>
              <li>All evidence records linked to controls</li>
              <li>Control overrides — status, owner, narrative, assessor notes, acceptable-evidence review checkboxes</li>
            </ul>
          </div>
          <div className="border border-ink-700 bg-ink-950 p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-status-met">
              WILL BE PRESERVED
            </div>
            <ul className="mt-2 list-disc pl-4 text-xs text-bone-200 space-y-1">
              <li>The 110-control NIST 800-171 framework</li>
              <li>Assessment metadata: dates, reporting period, classification, assessor, affirming officer</li>
              <li>Client record + all other clients/assessments</li>
              <li>Acceptable-evidence catalog (per-control templates)</li>
            </ul>
          </div>
        </div>

        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-bone-400">
            To confirm, type{" "}
            <code className="font-mono text-status-failed">{confirmPhrase}</code>
          </span>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            className="mt-1.5 w-full border border-ink-700 bg-ink-950 px-3 py-2 font-mono text-sm text-bone-100 focus:border-status-failed focus:outline-none"
          />
        </label>

        {err && (
          <div className="flex items-center gap-2 border border-status-failed/60 bg-status-failedBg px-3 py-2 text-xs text-status-failed">
            <AlertCircle size={12} /> {err}
          </div>
        )}

        <DialogActions onClose={onClose}>
          <button
            type="submit"
            disabled={!phraseMatches || submitting}
            className="inline-flex items-center gap-2 bg-status-failed px-4 py-2 text-xs font-medium text-bone-50 hover:bg-status-failed/80 disabled:opacity-50"
          >
            <RotateCcw size={12} /> {submitting ? "Resetting…" : "Reset to clean baseline"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

/* ---------- Form primitives ---------- */

function Dialog({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">{title}</div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  full = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email" | "date" | "number";
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
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
      />
    </label>
  );
}

function DialogActions({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
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
