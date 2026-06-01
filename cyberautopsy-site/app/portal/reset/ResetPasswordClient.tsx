"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, ShieldAlert } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

const MIN = 8;

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = (params.get("email") ?? "").toLowerCase();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  // Show an error immediately if the user landed here without the required params
  useEffect(() => {
    if (!token || !email) {
      setError(
        "Reset link is missing the token or email parameter. Request a new link from the forgot-password page."
      );
    }
  }, [token, email]);

  function passwordIssue(pw: string, conf: string): string | null {
    if (pw.length < MIN) return `Password must be at least ${MIN} characters.`;
    if (!/[A-Z]/.test(pw)) return "Include at least one uppercase letter.";
    if (!/[a-z]/.test(pw)) return "Include at least one lowercase letter.";
    if (!/[0-9]/.test(pw)) return "Include at least one digit.";
    if (pw !== conf) return "Passwords do not match.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDemoMessage(null);

    const issue = passwordIssue(password, confirm);
    if (issue) {
      setError(issue);
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      if (data.demo) setDemoMessage(data.message);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Reset failed");
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
              PASSWORD RESET · STEP 2
            </div>
            <h1 className="mt-3 font-serif text-3xl tracking-tightest text-bone-50">
              Choose a new password.
            </h1>
            {email && (
              <p className="mt-2 text-sm text-bone-300">
                For <span className="font-mono text-bone-100">{email}</span>
              </p>
            )}
          </header>

          {status === "success" ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="flex h-14 w-14 items-center justify-center border-2 border-status-met bg-status-metBg">
                <Check size={24} className="text-status-met" />
              </div>
              <h2 className="mt-5 font-serif text-2xl text-bone-50">Password updated.</h2>
              <p className="mt-2 text-sm text-bone-300">
                {demoMessage ??
                  "Your password has been changed. Sign in with the new password."}
              </p>
              <Link
                href="/portal"
                className="mt-8 inline-flex items-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200"
              >
                Sign in <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
              <label className="block">
                <span className="text-[11px] uppercase tracking-widest text-bone-400">New password</span>
                <div className="mt-2 flex items-stretch">
                  <input
                    type={revealed ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="flex-1 border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 focus:border-gold-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setRevealed((r) => !r)}
                    aria-label={revealed ? "Hide password" : "Show password"}
                    className="border border-ink-700 border-l-0 bg-ink-950 px-3 text-bone-400 hover:text-gold-300"
                  >
                    {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrength value={password} />
              </label>

              <label className="block">
                <span className="text-[11px] uppercase tracking-widest text-bone-400">Confirm new password</span>
                <input
                  type={revealed ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="mt-2 w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 focus:border-gold-300 focus:outline-none"
                />
              </label>

              {error && (
                <div role="alert" className="flex gap-2 border border-status-failed/60 bg-status-failedBg p-3 text-xs text-bone-100">
                  <ShieldAlert size={14} className="text-status-failed shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "submitting" || !token || !email}
                className="inline-flex w-full items-center justify-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "submitting" ? "Updating…" : (<>Update password <ArrowRight size={14} /></>)}
              </button>

              <Link
                href="/portal/forgot"
                className="inline-flex items-center gap-1 font-mono text-[10px] tracking-widest2 text-bone-400 hover:text-bone-100"
              >
                <ArrowLeft size={11} />
                REQUEST A NEW LINK
              </Link>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-bone-400">
          Reset links expire 15 minutes after issuance. Your old password remains valid until you
          complete this form.
        </p>
      </div>
    </div>
  );
}

/** Visual strength indicator (per-rule checkboxes). Server enforces these too. */
function PasswordStrength({ value }: { value: string }) {
  const checks = [
    { label: `At least ${MIN} characters`, ok: value.length >= MIN },
    { label: "Uppercase letter",            ok: /[A-Z]/.test(value) },
    { label: "Lowercase letter",            ok: /[a-z]/.test(value) },
    { label: "Digit",                       ok: /[0-9]/.test(value) }
  ];
  return (
    <ul className="mt-3 grid grid-cols-2 gap-1 text-[11px]">
      {checks.map((c) => (
        <li key={c.label} className={c.ok ? "text-status-met" : "text-bone-400"}>
          {c.ok ? "✓" : "·"} {c.label}
        </li>
      ))}
    </ul>
  );
}
