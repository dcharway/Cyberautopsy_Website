"use client";

import { useEffect, useState } from "react";
import { X, FileText, AlertOctagon, History, MessageSquare, Paperclip, Upload, type LucideIcon } from "lucide-react";
import type { Control } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

type Tab = "overview" | "evidence" | "poam" | "history" | "notes";

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "Overview",       icon: FileText },
  { key: "evidence", label: "Evidence",       icon: Paperclip },
  { key: "poam",     label: "POA&M",          icon: AlertOctagon },
  { key: "history",  label: "History",        icon: History },
  { key: "notes",    label: "Assessor Notes", icon: MessageSquare }
];

export function ControlDrawer({
  control,
  onClose
}: {
  control: Control | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const open = control !== null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
          "fixed right-0 top-0 z-50 h-full w-full max-w-[560px] border-l border-gold-300/30 bg-ink-900 shadow-gilt transition-transform duration-300",
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
              {tab === "overview" && <Overview control={control} />}
              {tab === "evidence" && <Evidence control={control} />}
              {tab === "poam" && <POAM control={control} />}
              {tab === "history" && <HistoryTab />}
              {tab === "notes" && <Notes />}
            </div>

            {/* Footer */}
            <footer className="border-t border-ink-700 p-4 flex items-center justify-end gap-2">
              <button className="border border-ink-700 px-3 py-1.5 text-xs text-bone-200 hover:border-bone-300">
                Reassign owner
              </button>
              <button className="bg-gold-300 px-4 py-1.5 text-xs font-medium text-ink-950 hover:bg-gold-200">
                Mark Implemented
              </button>
            </footer>
          </div>
        )}
      </aside>
    </>
  );
}

function Overview({ control }: { control: Control }) {
  return (
    <div className="space-y-6">
      <Section title="Requirement">
        <p className="text-sm leading-relaxed text-bone-200">{control.requirement}</p>
      </Section>

      <Section title="Implementation narrative">
        <p className="text-sm text-bone-300">
          {control.narrative ?? "No narrative authored yet. Required for SSP Appendix D submission."}
        </p>
        <button className="mt-3 border border-ink-700 px-3 py-1.5 text-xs text-bone-200 hover:border-gold-300 hover:text-gold-100">
          + Add narrative
        </button>
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
    </div>
  );
}

function Evidence({ control }: { control: Control }) {
  return (
    <div className="space-y-5">
      <Section title="Linked artifacts">
        {control.evidenceIds.length > 0 ? (
          <ul className="divide-y divide-ink-700 border border-ink-700">
            {control.evidenceIds.map((id) => (
              <li key={id} className="flex items-center justify-between gap-3 p-3">
                <div>
                  <div className="font-mono text-xs text-bone-100">{id}</div>
                  <div className="text-[11px] text-bone-400">
                    Config Export · collected 2026-05-10 · expires 2026-11-10
                  </div>
                </div>
                <span className="font-mono text-[10px] tracking-widest2 text-status-met">VALID</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-bone-400">No artifacts linked. Required at audit.</p>
        )}
      </Section>

      <div className="border border-dashed border-ink-700 p-6 text-center">
        <Upload size={20} className="mx-auto text-bone-400" />
        <p className="mt-2 text-sm text-bone-200">Drop a file or browse</p>
        <p className="mt-1 text-[11px] text-bone-400">
          Auto-renamed: {control.id}_artifact_YYYY-MM-DD.ext
        </p>
      </div>
    </div>
  );
}

function POAM({ control }: { control: Control }) {
  if (!control.poamId) {
    return <p className="text-sm text-bone-400">No POA&M open against this control.</p>;
  }
  return (
    <div className="space-y-5">
      <Section title="POA&M item">
        <div className="border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs text-gold-300">{control.poamId}</span>
            <span className="font-mono text-[10px] tracking-widest2 text-status-partial">IN REMEDIATION</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <Field k="Risk" v="Medium" />
            <Field k="Owner" v={control.owner ?? "—"} />
            <Field k="Opened" v="2026-04-02" />
            <Field k="Closes by" v="2026-07-31" />
          </div>
          <div className="mt-4 border-t border-ink-700 pt-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
              Remediation plan
            </div>
            <p className="mt-1 text-sm text-bone-200">
              Roll forward configuration baseline to the CIS Benchmark v3. Re-scan 10% sample,
              capture exports, mark control Implemented after verification.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

function HistoryTab() {
  const items = [
    { d: "2026-05-12", who: "J. Smith",   what: "Status changed from Partial → Implemented" },
    { d: "2026-04-28", who: "R. Vasquez", what: "Evidence EVD-AC-014 attached" },
    { d: "2026-04-02", who: "M. Okafor",  what: "POA&M-014 created (Medium risk)" },
    { d: "2026-03-15", who: "A. Sterling",what: "Owner assigned to J. Smith" }
  ];
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

function Notes() {
  return (
    <div className="space-y-4">
      <div className="border border-ink-700 bg-ink-950 p-4">
        <div className="font-mono text-[10px] tracking-widest2 text-status-review">VERITAS CYBER · K. PRESCOTT</div>
        <p className="mt-2 text-sm text-bone-200">
          Need configuration export dated within 6 months. Current screenshot is 14 months old.
          Treating as outstanding until refreshed.
        </p>
        <div className="mt-3 font-mono text-[10px] text-bone-400">2026-05-09 · 14:32 EDT</div>
      </div>
      <textarea
        rows={3}
        placeholder="Reply to assessor…"
        className="w-full border border-ink-700 bg-ink-950 p-3 text-sm text-bone-100 placeholder:text-bone-400 focus:border-gold-300 focus:outline-none"
      />
      <button className="bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200">
        Send reply →
      </button>
    </div>
  );
}

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
