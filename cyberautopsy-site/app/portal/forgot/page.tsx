"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Copy, Mail } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [demoLink, setDemoLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setMessage(data.message);
      setDemoLink(data.resetUrl ?? null);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setStatus("error");
    }
  }

  async function copyDemoLink() {
    if (!demoLink) return;
    try {
      await navigator.clipboard.writeText(demoLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950 via-ink-950 to-ink-900" />

      <div className="mx-auto max-w-md px-6 py-20 lg:py-28">
        <div className="border border-gold-300/40 bg-ink-900 p-8 shadow-gilt sm:p-10">
          <header className="border-b border-ink-700 pb-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
              PASSWORD RESET
            </div>
            <h1 className="mt-3 font-serif text-3xl tracking-tightest text-bone-50">
              Forgot your password.
            </h1>
            <p className="mt-2 text-sm text-bone-400">
              Enter the email associated with your engagement. We send a one-time link that expires
              in 15 minutes.
            </p>
          </header>

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="flex h-14 w-14 items-center justify-center border-2 border-status-met bg-status-metBg">
                <Check size={24} className="text-status-met" />
              </div>
              <h2 className="mt-5 font-serif text-2xl text-bone-50">Check your inbox.</h2>
              <p className="mt-2 text-sm text-bone-300">{message}</p>

              {demoLink && (
                <div className="mt-6 border border-gold-300/40 bg-gold-300/5 p-5">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-gold-300">
                    <Mail size={12} />
                    DEMO MODE — RESET LINK
                  </div>
                  <p className="mt-2 text-xs text-bone-300">
                    In production this URL only arrives via email. For the demo, we surface it here.
                  </p>
                  <div className="mt-3 flex items-center gap-2 border border-ink-700 bg-ink-950 p-3 font-mono text-[11px] text-bone-100 break-all">
                    {demoLink}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={demoLink}
                      className="inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200"
                    >
                      Open reset page <ArrowRight size={12} />
                    </a>
                    <button
                      type="button"
                      onClick={copyDemoLink}
                      className="inline-flex items-center gap-2 border border-ink-700 px-4 py-2 text-xs text-bone-200 hover:border-gold-300 hover:text-gold-100"
                    >
                      <Copy size={12} />
                      {copied ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              )}

              <Link
                href="/portal"
                className="mt-8 inline-flex items-center gap-1 font-mono text-[10px] tracking-widest2 text-bone-400 hover:text-bone-100"
              >
                <ArrowLeft size={11} />
                BACK TO SIGN IN
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
              <label className="block">
                <span className="text-[11px] uppercase tracking-widest text-bone-400">Work email</span>
                <input
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@cyberautopsy.com"
                  autoComplete="username"
                  className="mt-2 w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 placeholder:text-bone-400 focus:border-gold-300 focus:outline-none"
                />
              </label>

              {error && (
                <div role="alert" className="border border-status-failed/60 bg-status-failedBg p-2 text-xs text-bone-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex w-full items-center justify-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : (<>Send reset link <ArrowRight size={14} /></>)}
              </button>

              <Link
                href="/portal"
                className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] tracking-widest2 text-bone-400 hover:text-bone-100"
              >
                <ArrowLeft size={11} />
                BACK TO SIGN IN
              </Link>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-bone-400">
          Need help? Contact your assigned Compliance Surgeon directly. Reset links never expire
          your password until you complete the reset form.
        </p>
      </div>
    </div>
  );
}
