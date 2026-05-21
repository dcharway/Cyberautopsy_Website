"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function LeadMagnetForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [cage, setCage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

    try {
      const res = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cage, website: honeypot })
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Submission failed.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Submission failed.");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-10 mx-auto max-w-xl border border-gold-300/40 bg-gold-300/5 p-6 text-left">
        <div className="font-mono text-[11px] tracking-widest2 text-gold-300">BRIEF QUEUED</div>
        <p className="mt-3 text-bone-100">
          A partner will send the six-page brief to your inbox from a personal address. We do not enroll you in any automation.
        </p>
      </div>
    );
  }

  return (
    <form className="mt-10 mx-auto grid max-w-xl gap-3 sm:grid-cols-[1fr_140px]" onSubmit={onSubmit} noValidate>
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <input
        type="email"
        required
        aria-label="Work email"
        placeholder="Work email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-ink-700 bg-ink-950 px-4 py-3 text-sm text-bone-100 placeholder:text-bone-400 focus:border-gold-300"
      />
      <input
        type="text"
        required
        maxLength={5}
        aria-label="CAGE code"
        placeholder="CAGE code"
        value={cage}
        onChange={(e) => setCage(e.target.value.toUpperCase().slice(0, 5))}
        pattern="[A-Z0-9]{5}"
        className="border border-ink-700 bg-ink-950 px-4 py-3 font-mono text-sm uppercase text-bone-100 placeholder:text-bone-400 focus:border-gold-300"
      />

      {status === "error" && error && (
        <div role="alert" className="sm:col-span-2 border border-signal-red/60 bg-signal-red/10 p-3 text-sm text-bone-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="sm:col-span-2 bg-gold-300 px-6 py-3 text-sm font-medium text-ink-950 transition hover:bg-gold-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send me the brief →"}
      </button>
    </form>
  );
}
