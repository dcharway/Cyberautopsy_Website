"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  ArrowRight,
  Check,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Layers,
  type LucideIcon
} from "lucide-react";

type StatusResponse = {
  email: string;
  name: string | null;
  organization: string | null;
  emailVerified: boolean;
  role: "admin" | "demo" | "viewer";
  plan: { id: string; name: string } | null;
  subscriptionStatus:
    | "none"
    | "incomplete"
    | "trialing"
    | "active"
    | "past_due"
    | "unpaid"
    | "canceled"
    | "expired";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasPortalAccess: boolean;
  entitlementReason: string;
  stripeCustomerId?: string | null;
};

const STATUS_TONE: Record<StatusResponse["subscriptionStatus"], { label: string; tone: "ok" | "warn" | "bad" | "neutral" }> = {
  none:       { label: "No subscription",     tone: "neutral" },
  incomplete: { label: "Checkout incomplete", tone: "warn" },
  trialing:   { label: "Trial",               tone: "ok" },
  active:     { label: "Active",              tone: "ok" },
  past_due:   { label: "Past due",            tone: "warn" },
  unpaid:     { label: "Unpaid",              tone: "bad" },
  canceled:   { label: "Cancelling",          tone: "warn" },
  expired:    { label: "Expired",             tone: "bad" }
};

export function AccountPanel() {
  const params = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkoutFlag = params.get("checkout");

  async function fetchStatus(forEmail: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/subscription/status?email=${encodeURIComponent(forEmail)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lookup failed");
      setStatus(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  async function openBillingPortal() {
    if (!status) return;
    setError(null);
    try {
      const res = await fetch("/api/subscription/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: status.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open billing portal");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open billing portal");
    }
  }

  // If the user arrived via ?email=..., prefill so a first-time load lands the
  // right record without another prompt.
  useEffect(() => {
    const preset = params.get("email");
    if (preset) {
      setEmail(preset);
      void fetchStatus(preset);
    }
  }, [params]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-24">
      <span className="classified-stamp">ACCOUNT &amp; SUBSCRIPTION</span>
      <h1 className="mt-6 font-serif text-4xl tracking-tightest text-bone-50 sm:text-5xl">
        Your CyberAutopsy account.
      </h1>

      {checkoutFlag === "success" && (
        <div className="mt-6 flex items-center gap-3 border border-status-met/60 bg-status-metBg p-4 text-sm text-bone-50">
          <Check size={16} className="text-status-met shrink-0" />
          Subscription started. Access to the GRC dashboard will activate as soon as Stripe confirms
          the first payment (usually seconds).
        </div>
      )}
      {checkoutFlag === "cancelled" && (
        <div className="mt-6 flex items-center gap-3 border border-status-partial/60 bg-status-partialBg p-4 text-sm text-bone-50">
          <AlertCircle size={16} className="text-status-partial shrink-0" />
          Checkout cancelled. No charge was made. You can pick a plan again below.
        </div>
      )}

      {/* Email prompt when no session context */}
      {!status && (
        <div className="mt-10 border border-ink-700 bg-ink-900 p-6">
          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-bone-400">
              Enter your account email
            </span>
            <div className="mt-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="you@company.com"
                autoComplete="email"
                className="flex-1 border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => email && void fetchStatus(email)}
                disabled={loading || !email}
                className="inline-flex items-center gap-2 bg-gold-300 px-5 py-2.5 text-sm font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
              >
                {loading ? "Loading…" : "Look up"} <ArrowRight size={12} />
              </button>
            </div>
          </label>
          <p className="mt-3 text-xs text-bone-400">
            Not the sign-in flow — this page just reads your current subscription state. Full
            authentication happens at{" "}
            <Link href="/portal/signin" className="text-gold-300 hover:text-gold-100 underline">
              /portal/signin
            </Link>
            .
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center gap-3 border border-status-failed/60 bg-status-failedBg p-4 text-sm text-bone-100">
          <AlertCircle size={16} className="text-status-failed shrink-0" /> {error}
        </div>
      )}

      {status && (
        <div className="mt-10 space-y-6">
          {/* Identity + plan card */}
          <section className="border border-ink-700 bg-ink-900 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
                  ACCOUNT
                </div>
                <h2 className="mt-1 font-serif text-2xl text-bone-50">
                  {status.name ?? status.email}
                </h2>
                <p className="mt-1 text-xs text-bone-400">
                  {status.organization ?? "—"} · {status.email} · role: {status.role}
                </p>
              </div>
              <StatusChip status={status.subscriptionStatus} />
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <Row k="Current plan" v={status.plan ? status.plan.name : "No active plan"} />
              <Row k="Email verified" v={status.emailVerified ? "Yes" : "No — check inbox"} />
              <Row
                k="Renewal / period end"
                v={
                  status.currentPeriodEnd
                    ? new Date(status.currentPeriodEnd).toLocaleDateString()
                    : "—"
                }
              />
              <Row
                k="Cancels at period end"
                v={status.cancelAtPeriodEnd ? "Yes — access continues until then" : "No"}
              />
              <Row k="Portal access" v={status.hasPortalAccess ? "Enabled" : "Not enabled"} />
              <Row k="Entitlement reason" v={humanizeReason(status.entitlementReason)} />
            </dl>
          </section>

          {/* Actions */}
          <section className="grid gap-4 sm:grid-cols-2">
            {status.hasPortalAccess ? (
              <ActionCard
                icon={ShieldCheck}
                title="Access the GRC Dashboard"
                body="Jump into your CyberAutopsy GRC workspace."
                href="/portal/signin"
                cta="Open GRC dashboard"
              />
            ) : (
              <ActionCard
                icon={Layers}
                title="Start Your GRC Subscription"
                body="Pick a plan and activate access."
                href="/portal/plans"
                cta="View plans"
              />
            )}
            {status.stripeCustomerId !== null || status.subscriptionStatus !== "none" ? (
              <ActionCard
                icon={CreditCard}
                title="Manage Subscription"
                body="Update payment methods, download invoices, cancel or resume subscription."
                onClick={openBillingPortal}
                cta="Open billing portal"
              />
            ) : (
              <ActionCard
                icon={CreditCard}
                title="Manage Subscription"
                body="No billing account yet. Start a subscription first."
                href="/portal/plans"
                cta="View plans"
              />
            )}
            <ActionCard
              icon={LogOut}
              title="Sign Out"
              body="End this session on the portal."
              href="/auth/logout"
              cta="Sign out"
            />
            <ActionCard
              icon={AlertCircle}
              title="Support"
              body="Questions about billing, features, or your account."
              href="/contact"
              cta="Contact support"
            />
          </section>

          <p className="text-xs text-bone-400">
            Billing is handled by{" "}
            <a
              href="https://stripe.com"
              className="text-gold-300 hover:text-gold-100 underline"
              target="_blank"
              rel="noreferrer"
            >
              Stripe
            </a>
            . Card details are never stored on CyberAutopsy servers. See our{" "}
            <Link href="/legal/subscription" className="text-gold-300 hover:text-gold-100 underline">
              subscription terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/refund" className="text-gold-300 hover:text-gold-100 underline">
              refund policy
            </Link>
            .
          </p>
        </div>
      )}

      {(status?.stripeCustomerId !== undefined) && (
        <div className="mt-16 hidden">{/* placeholder to keep tree stable */}</div>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: StatusResponse["subscriptionStatus"] }) {
  const meta = STATUS_TONE[status];
  const toneClass =
    meta.tone === "ok"
      ? "border-status-met/60 bg-status-metBg text-status-met"
      : meta.tone === "warn"
      ? "border-status-partial/60 bg-status-partialBg text-status-partial"
      : meta.tone === "bad"
      ? "border-status-failed/60 bg-status-failedBg text-status-failed"
      : "border-ink-600 text-bone-400";
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] tracking-widest2 ${toneClass}`}>
      {meta.label.toUpperCase()}
    </span>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{k}</dt>
      <dd className="mt-1 text-sm text-bone-100">{v}</dd>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  body,
  href,
  onClick,
  cta
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  href?: string;
  onClick?: () => void;
  cta: string;
}) {
  const inner = (
    <>
      <div className="flex h-10 w-10 items-center justify-center border border-gold-300/50 bg-gold-300/5 text-gold-300">
        <Icon size={18} />
      </div>
      <h3 className="mt-3 font-serif text-xl text-bone-50">{title}</h3>
      <p className="mt-2 text-sm text-bone-300">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-widest2 text-gold-300">
        {cta.toUpperCase()} <ArrowRight size={11} />
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="block border border-ink-700 bg-ink-900 p-6 transition hover:border-gold-300/50">
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-left border border-ink-700 bg-ink-900 p-6 transition hover:border-gold-300/50"
    >
      {inner}
    </button>
  );
}

function humanizeReason(r: string): string {
  switch (r) {
    case "admin": return "Admin account — full access";
    case "demo": return "Demo account — read-only sample data";
    case "subscribed": return "Active paid subscription";
    case "no-subscription": return "No active subscription — choose a plan";
    case "email-unverified": return "Email address not yet verified";
    case "expired": return "Subscription has expired — reactivate below";
    default: return r;
  }
}
