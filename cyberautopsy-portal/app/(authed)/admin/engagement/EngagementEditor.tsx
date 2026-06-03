"use client";

import { useState } from "react";
import { Save, RotateCcw, Check, AlertCircle } from "lucide-react";
import type { Engagement } from "@/lib/engagement";

type Props = { initial: Engagement };

type Status = "idle" | "saving" | "saved" | "error";

const SECTIONS: Array<{
  title: string;
  hint: string;
  fields: Array<{
    key: keyof Engagement;
    label: string;
    placeholder?: string;
    type?: "text" | "date" | "email" | "number" | "textarea";
    width?: "full" | "half";
  }>;
}> = [
  {
    title: "Client identity",
    hint: "Used on every cover page, header, and exported filename.",
    fields: [
      { key: "organization",      label: "Organization (display)",  placeholder: "Northwind Defense Systems", width: "full" },
      { key: "organizationLegal", label: "Organization (legal)",    placeholder: "Northwind Defense Systems, LLC", width: "full" },
      { key: "cage",              label: "CAGE code",               placeholder: "1A2B3", width: "half" },
      { key: "ducns",             label: "DUNS (optional)",         placeholder: "078912345", width: "half" },
      { key: "systemBoundary",    label: "System boundary",         placeholder: "CUI Enclave — Primary", width: "full" },
      { key: "contractValueUSD",  label: "Active contract value (USD)", type: "number", width: "half" }
    ]
  },
  {
    title: "Engagement parties",
    hint: "Names that appear on the SSP authorship line + audit packet.",
    fields: [
      { key: "assessor",  label: "Lead assessor (RPO surgeon)", placeholder: "M. Okafor", width: "half" },
      { key: "rpoFirm",   label: "RPO firm",                    placeholder: "CyberAutopsy LLC", width: "half" },
      { key: "c3paoFirm", label: "C3PAO of record",             placeholder: "Veritas Cyber Assessors", width: "full" }
    ]
  },
  {
    title: "Dates",
    hint: "Drive the timeline + reporting-period column on every export.",
    fields: [
      { key: "engagementStart", label: "Engagement start",   type: "date", width: "half" },
      { key: "scheduledClose",  label: "Audit-ready target", type: "date", width: "half" },
      { key: "reportingPeriod", label: "Reporting period",   placeholder: "2026-Q2", width: "half" }
    ]
  },
  {
    title: "Document defaults",
    hint: "Brand boilerplate on the cover + page footer of every export.",
    fields: [
      { key: "documentVersion", label: "Document version", placeholder: "v1.0", width: "half" },
      { key: "classification",  label: "Classification",   placeholder: "Controlled Unclassified Information (CUI)", width: "full" }
    ]
  },
  {
    title: "Annual affirmation",
    hint: "Populates the Affirmation Statement export + the /affirmations dashboard.",
    fields: [
      { key: "affirmingOfficial",       label: "Affirming senior officer",   placeholder: "C. Northwind", width: "half" },
      { key: "affirmingOfficialTitle",  label: "Title",                      placeholder: "Chief Executive Officer", width: "half" },
      { key: "affirmingOfficialEmail",  label: "Email (optional)",           type: "email", width: "half" },
      { key: "lastAffirmation",         label: "Last affirmation",           type: "date", width: "half" },
      { key: "nextAffirmationDue",      label: "Next affirmation due",       type: "date", width: "half" }
    ]
  }
];

export function EngagementEditor({ initial }: Props) {
  const [form, setForm] = useState<Engagement>(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function update<K extends keyof Engagement>(key: K, value: Engagement[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setForm(data.engagement);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2400);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
    }
  }

  function reset() {
    setForm(initial);
    setStatus("idle");
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {SECTIONS.map((section) => (
        <section key={section.title} className="border border-ink-700 bg-ink-900 p-6">
          <header className="border-b border-ink-700 pb-4">
            <h2 className="font-serif text-xl text-bone-50">{section.title}</h2>
            <p className="mt-1 text-xs text-bone-400">{section.hint}</p>
          </header>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => {
              const v = form[field.key];
              const display = v == null ? "" : String(v);
              return (
                <label
                  key={String(field.key)}
                  className={field.width === "full" ? "sm:col-span-2" : undefined}
                >
                  <span className="text-[11px] uppercase tracking-widest text-bone-400">
                    {field.label}
                  </span>
                  <input
                    type={field.type ?? "text"}
                    value={display}
                    placeholder={field.placeholder}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const next = field.type === "number"
                        ? (raw === "" ? undefined : Number(raw))
                        : raw;
                      update(field.key, next as Engagement[typeof field.key]);
                    }}
                    className="mt-2 w-full border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
                  />
                </label>
              );
            })}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 border border-gold-300/40 bg-ink-900/95 px-5 py-4 shadow-gilt backdrop-blur">
        <div className="text-xs text-bone-400">
          Last updated{" "}
          <span className="font-mono text-bone-200">
            {new Date(form.updatedAt).toLocaleString("en-US")}
          </span>
          {" "}by{" "}
          <span className="font-mono text-bone-200">{form.updatedBy}</span>
        </div>
        <div className="flex items-center gap-3">
          {status === "saved" && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-status-met">
              <Check size={12} /> SAVED
            </span>
          )}
          {status === "error" && errorMsg && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-status-failed">
              <AlertCircle size={12} /> {errorMsg}
            </span>
          )}
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 border border-ink-700 px-4 py-2 text-xs text-bone-200 hover:border-bone-300"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            type="submit"
            disabled={status === "saving"}
            className="inline-flex items-center gap-2 bg-gold-300 px-5 py-2.5 text-xs font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
          >
            <Save size={13} />
            {status === "saving" ? "Saving…" : "Save engagement"}
          </button>
        </div>
      </div>
    </form>
  );
}
