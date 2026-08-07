"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, AlertCircle, Loader2 } from "lucide-react";

type State = "verifying" | "verified" | "error";

export function VerifyClient() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email || !token) {
      setState("error");
      setError("Missing verification parameters. Follow the link from your verification email.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token })
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Verification failed");
        setState("verified");
      } catch (err) {
        if (cancelled) return;
        setState("error");
        setError(err instanceof Error ? err.message : "Verification failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [email, token]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 lg:py-32">
      {state === "verifying" && (
        <div className="border border-ink-700 bg-ink-900 p-8 text-center">
          <Loader2 size={26} className="mx-auto text-gold-300 animate-spin" />
          <h1 className="mt-6 font-serif text-3xl tracking-tightest text-bone-50">Verifying…</h1>
          <p className="mt-3 text-sm text-bone-400">One moment while we confirm your address.</p>
        </div>
      )}
      {state === "verified" && (
        <div className="border border-status-met/60 bg-status-metBg p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-status-met bg-ink-950">
            <Check size={26} className="text-status-met" />
          </div>
          <h1 className="mt-6 font-serif text-3xl tracking-tightest text-bone-50">Email verified</h1>
          <p className="mt-3 text-sm text-bone-200">
            You&rsquo;re all set. Next, pick a subscription plan or sign in.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/portal/plans`}
              className="inline-flex items-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200"
            >
              View subscription plans &rarr;
            </Link>
            <Link
              href={`/portal/signin`}
              className="inline-flex items-center gap-2 border border-bone-300/30 px-5 py-3 text-sm text-bone-100 hover:border-gold-300 hover:text-gold-300"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
      {state === "error" && (
        <div className="border border-status-failed/60 bg-status-failedBg p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-status-failed bg-ink-950">
            <AlertCircle size={26} className="text-status-failed" />
          </div>
          <h1 className="mt-6 font-serif text-3xl tracking-tightest text-bone-50">
            Verification failed
          </h1>
          <p className="mt-3 text-sm text-bone-200">{error}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/portal/signin"
              className="inline-flex items-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200"
            >
              Sign in &rarr;
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-bone-300/30 px-5 py-3 text-sm text-bone-100 hover:border-gold-300 hover:text-gold-300"
            >
              Contact support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
