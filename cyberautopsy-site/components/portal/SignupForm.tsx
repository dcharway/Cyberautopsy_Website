"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserPlus, Check, AlertCircle, ArrowRight } from "lucide-react";
import { PLANS } from "@/lib/subscription/plans";

type Status = "idle" | "submitting" | "sent" | "error";

const MIN_PASSWORD_LEN = 12;

export function SignupForm() {
  const params = useSearchParams();
  const preselectedPlan = params.get("plan") ?? "";
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    password: "",
    plan: preselectedPlan,
    acceptedTerms: false
  });
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (form.password.length < MIN_PASSWORD_LEN) {
      setStatus("error");
      setMessage(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
      return;
    }
    if (!form.acceptedTerms) {
      setStatus("error");
      setMessage("You must accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          organization: form.organization,
          password: form.password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      setStatus("sent");
      setMessage(data.message ?? "Check your email to verify your account.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Registration failed");
    }
  }

  if (status === "sent") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 lg:py-32">
        <div className="border border-status-met/60 bg-status-metBg p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-status-met bg-ink-950">
            <Check size={26} className="text-status-met" />
          </div>
          <h1 className="mt-6 font-serif text-3xl tracking-tightest text-bone-50">
            Check your email
          </h1>
          <p className="mt-4 text-bone-200">{message}</p>
          <p className="mt-6 text-xs text-bone-400">
            If nothing arrives within a few minutes, check your spam folder or{" "}
            <Link href="/contact" className="text-gold-300 hover:text-gold-100 underline">
              contact us
            </Link>
            .
          </p>
          <Link
            href="/portal/signin"
            className="mt-8 inline-flex items-center gap-2 border border-gold-300/40 bg-gold-300/5 px-5 py-3 text-sm text-gold-100 hover:bg-gold-300 hover:text-ink-950"
          >
            Continue to sign in <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10 lg:py-24">
      <span className="classified-stamp">CLIENT PORTAL · CREATE ACCOUNT</span>
      <h1 className="mt-6 font-serif text-4xl tracking-tightest text-bone-50 sm:text-5xl">
        Create your account.
      </h1>
      <p className="mt-3 text-sm text-bone-400">
        A verification email lands in your inbox seconds after you submit. Choose a plan next.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-5" noValidate>
        <Field label="Full name *">
          <input
            type="text"
            required
            autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            autoComplete="name"
            maxLength={120}
            className="w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
          />
        </Field>

        <Field label="Organization *">
          <input
            type="text"
            required
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            placeholder="Northwind Defense Systems"
            autoComplete="organization"
            maxLength={200}
            className="w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
          />
        </Field>

        <Field label="Work email *">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })}
            placeholder="you@company.com"
            autoComplete="username"
            className="w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
          />
        </Field>

        <Field label={`Password * (minimum ${MIN_PASSWORD_LEN} characters)`}>
          <input
            type="password"
            required
            minLength={MIN_PASSWORD_LEN}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
            className="w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
          />
        </Field>

        <Field label="Preferred plan (optional — you can choose after registration)">
          <select
            value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            className="w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 focus:border-gold-300 focus:outline-none"
          >
            <option value="">— Decide after registration —</option>
            {PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.monthlyPriceUSD !== null ? ` · $${p.monthlyPriceUSD.toLocaleString()}/mo` : " · custom pricing"}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex items-start gap-3 text-sm text-bone-200">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={(e) => setForm({ ...form, acceptedTerms: e.target.checked })}
            className="mt-1 h-4 w-4 border-ink-700 bg-ink-950 accent-gold-300"
          />
          <span>
            I agree to the{" "}
            <Link href="/legal/terms" className="text-gold-300 hover:text-gold-100 underline">Terms of Service</Link>,{" "}
            <Link href="/legal/privacy" className="text-gold-300 hover:text-gold-100 underline">Privacy Policy</Link>, and{" "}
            <Link href="/legal/subscription" className="text-gold-300 hover:text-gold-100 underline">Subscription Terms</Link>.
          </span>
        </label>

        {status === "error" && message && (
          <div
            role="alert"
            className="flex items-center gap-2 border border-status-failed/60 bg-status-failedBg p-3 text-sm text-bone-100"
          >
            <AlertCircle size={14} className="text-status-failed shrink-0" /> {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
        >
          <UserPlus size={14} />
          {status === "submitting" ? "Creating your account…" : "Create Your Account"}
        </button>

        <p className="text-center text-xs text-bone-400">
          Already have an account?{" "}
          <Link href="/portal/signin" className="text-gold-300 hover:text-gold-100 underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-bone-400">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
