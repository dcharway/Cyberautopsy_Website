import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";

type Props = {
  feature: string;
  description: string;
};

/**
 * Shown to demo / viewer roles when they navigate to an admin-only page.
 * Brand-matched, non-aggressive — sets expectations and gives a CTA back to
 * the marketing site for upgrade.
 */
export function AdminLockScreen({ feature, description }: Props) {
  return (
    <div className="mx-auto max-w-2xl py-16">
      <div className="border border-gold-300/40 bg-ink-900 p-10 shadow-gilt text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-gold-300/40 bg-gold-300/5">
          <Lock size={22} className="text-gold-300" />
        </div>

        <div className="mt-6 font-mono text-[10px] uppercase tracking-widest text-gold-300">
          ADMIN-ONLY FEATURE
        </div>
        <h1 className="mt-3 font-serif text-3xl tracking-tightest text-bone-50">
          {feature} requires an admin role.
        </h1>
        <p className="mt-4 text-sm text-bone-300 leading-relaxed max-w-prose mx-auto">{description}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 max-w-md mx-auto">
          <Link
            href="https://www.cyberautopsy.org/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gold-300 px-4 py-3 text-xs font-medium text-ink-950 hover:bg-gold-200"
          >
            Request admin access
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border border-ink-700 px-4 py-3 text-xs text-bone-200 hover:border-bone-300"
          >
            Back to overview
          </Link>
        </div>

        <div className="mt-8 border-t border-ink-700 pt-5">
          <div className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-bone-400">
            <ShieldCheck size={11} className="text-status-met" />
            DEMO SESSIONS ARE READ-ONLY BY DESIGN
          </div>
          <p className="mt-2 text-[11px] text-bone-500">
            Read-only browsing of the dashboard, controls, evidence, POA&amp;Ms, and
            assessments is available to demo accounts so you can evaluate the workspace
            before engaging.
          </p>
        </div>
      </div>
    </div>
  );
}
