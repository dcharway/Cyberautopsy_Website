"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

const SEGMENTS = ["Prime contractor", "Subcontractor", "Manufacturer", "SaaS / ESP", "University"];
const CUI_OPTIONS = ["Yes", "Unsure", "No"];

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState("");
  const [cage, setCage] = useState("");
  const [segment, setSegment] = useState("");
  const [cui, setCui] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, cage, segment, cui, contractValue, email, website: honeypot })
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Submission failed. Please try email or Calendly below.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Submission failed. Please try email or Calendly below.");
    }
  }

  return (
    <>
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:px-10 lg:pt-32 lg:pb-28">
          <span className="classified-stamp">15-MINUTE TRIAGE</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            Book a Contract <span className="gold-text">Risk Audit.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            A direct call with a partner. You bring your CAGE code and the contract you cannot
            afford to lose. We tell you, straight, whether you should be alarmed and what the next
            90 days should look like. No pitch deck, no sales engineer.
          </p>
        </div>
      </section>

      <section className="bg-ink-950 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            {/* QUALIFIER FORM */}
            <div className="border border-ink-700 bg-ink-900 p-8 lg:p-10">
              <h2 className="font-serif text-2xl text-bone-50">Tell us about your engagement</h2>
              <p className="mt-2 text-sm text-bone-400">
                Five questions. We use these to route the call to the right partner.
              </p>

              {status === "success" ? (
                <div className="mt-8 border border-gold-300/40 bg-gold-300/5 p-6">
                  <div className="font-mono text-[11px] tracking-widest2 text-gold-300">
                    INTAKE RECEIVED
                  </div>
                  <p className="mt-3 text-bone-100">
                    Thank you. A partner will reach out within one business day from a personal
                    address. If your situation is urgent, use the Calendly to the right to put a
                    time directly on the founder&rsquo;s calendar.
                  </p>
                </div>
              ) : (
                <form className="mt-8 grid gap-5" onSubmit={onSubmit} noValidate>
                  {/* Honeypot — hidden field, real users leave it empty */}
                  <div className="hidden" aria-hidden="true">
                    <label>
                      Website
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>

                  <Field label="Company" htmlFor="company">
                    <input
                      id="company"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="mt-2 w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 focus:border-gold-300"
                    />
                  </Field>

                  <Field label="CAGE code" htmlFor="cage">
                    <input
                      id="cage"
                      required
                      maxLength={5}
                      placeholder="1A2B3"
                      value={cage}
                      onChange={(e) => setCage(e.target.value.toUpperCase().slice(0, 5))}
                      pattern="[A-Z0-9]{5}"
                      className="mt-2 w-full border border-ink-700 bg-ink-950 px-3 py-3 font-mono text-sm uppercase text-bone-100 placeholder:text-bone-400 focus:border-gold-300"
                    />
                  </Field>

                  <fieldset>
                    <legend className="text-[11px] uppercase tracking-widest text-bone-400">
                      You are a
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {SEGMENTS.map((s) => (
                        <Pill key={s} name="segment" value={s} checked={segment === s} onChange={setSegment}>
                          {s}
                        </Pill>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-[11px] uppercase tracking-widest text-bone-400">
                      Do you handle CUI today?
                    </legend>
                    <div className="mt-2 flex gap-2">
                      {CUI_OPTIONS.map((s) => (
                        <Pill key={s} name="cui" value={s} checked={cui === s} onChange={setCui}>
                          {s}
                        </Pill>
                      ))}
                    </div>
                  </fieldset>

                  <Field label="Contract value at risk (USD)" htmlFor="contractValue">
                    <input
                      id="contractValue"
                      placeholder="e.g. $8,000,000"
                      value={contractValue}
                      onChange={(e) => setContractValue(e.target.value)}
                      className="mt-2 w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 placeholder:text-bone-400 focus:border-gold-300"
                    />
                  </Field>

                  <Field label="Work email" htmlFor="email">
                    <input
                      id="email"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 focus:border-gold-300"
                    />
                  </Field>

                  {status === "error" && error && (
                    <div role="alert" className="border border-signal-red/60 bg-signal-red/10 p-3 text-sm text-bone-100">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="mt-3 bg-gold-300 px-6 py-3 text-sm font-medium text-ink-950 transition hover:bg-gold-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "submitting" ? "Sending intake…" : "Send intake →"}
                  </button>
                  <p className="text-[11px] text-bone-400">
                    Submissions are held under NDA terms commensurate with a DFARS 7012 environment.
                  </p>
                </form>
              )}
            </div>

            {/* CALENDLY EMBED */}
            <div className="border border-gold-300/40 bg-ink-900 p-8 lg:p-10 shadow-gilt">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-bone-50">Put it on the founder&rsquo;s calendar</h2>
                <span className="font-mono text-[10px] tracking-widest2 text-gold-300">DIRECT</span>
              </div>
              <p className="mt-2 text-sm text-bone-400">
                Fifteen minutes. No pitch. Bring the contract or the email from the prime.
              </p>

              <div className="mt-6 border border-ink-700 bg-ink-950 p-1">
                <iframe
                  src={SITE.calendly}
                  width="100%"
                  height="640"
                  title="Book a Contract Risk Audit with CyberAutopsy"
                  className="block w-full"
                  loading="lazy"
                />
              </div>

              <div className="mt-6 grid gap-3 text-sm text-bone-300">
                <div>
                  <span className="font-mono text-[10px] tracking-widest2 text-bone-400">EMAIL</span>
                  <div className="mt-1">
                    <a className="hover:text-gold-300" href={`mailto:${SITE.email}`}>{SITE.email}</a>
                  </div>
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-widest2 text-bone-400">PHONE (TRIAGE LINE)</span>
                  <div className="mt-1">{SITE.phone}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink-900 py-20 border-t border-ink-700/60">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <p className="text-bone-300">
            Not ready to book? Run the{" "}
            <Link href="/#risk-calculator" className="text-gold-300 hover:text-gold-100">
              Contract Risk Calculator
            </Link>{" "}
            first.
          </p>
        </div>
      </section>
    </>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-[11px] uppercase tracking-widest text-bone-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function Pill({
  name,
  value,
  checked,
  onChange,
  children
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span className="block border border-ink-700 px-4 py-2 text-sm text-bone-300 transition hover:border-bone-300 peer-checked:border-gold-300 peer-checked:bg-gold-300/10 peer-checked:text-gold-100">
        {children}
      </span>
    </label>
  );
}
