"use client";

import { Search, Bell, ChevronDown, LogOut, KeyRound, Smartphone, ShieldCheck, User as UserIcon } from "lucide-react";
import { ORG } from "@/lib/utils";
import type { Role } from "@/lib/auth/session";

type Props = {
  userEmail?: string;
  mfaMethod?: "totp" | "webauthn";
  role?: Role;
};

const ROLE_BADGE: Record<Role, { label: string; className: string; icon: React.ComponentType<{ size?: number }> }> = {
  admin:  { label: "ADMIN",   className: "border-gold-300/60 bg-gold-300/10 text-gold-200",                  icon: ShieldCheck },
  demo:   { label: "DEMO",    className: "border-status-review/60 bg-status-reviewBg text-status-review",   icon: UserIcon },
  viewer: { label: "VIEWER",  className: "border-ink-600 text-bone-400",                                    icon: UserIcon }
};

export function TopBar({
  userEmail = "demo@cyberautopsy.com",
  mfaMethod = "totp",
  role = "viewer"
}: Props) {
  const safeEmail = userEmail || "demo@cyberautopsy.com";
  const initials = safeEmail.slice(0, 1).toUpperCase();
  // Defensive: handle any unexpected role value without crashing the shell.
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.viewer;
  const RoleIcon = badge.icon;
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-6 border-b border-ink-700/70 bg-ink-950/95 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center border border-gold-300/40 bg-gold-300/5">
          <span className="font-mono text-xs text-gold-300">ND</span>
        </div>
        <div className="hidden lg:block">
          <div className="text-sm text-bone-50">{ORG.name}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
            CAGE {ORG.cage} &middot; {ORG.systemBoundary}
          </div>
        </div>
        <ChevronDown size={14} className="hidden text-bone-400 lg:block" />
      </div>

      <div className="hidden h-8 w-px bg-ink-700 lg:block" />

      <div className="hidden flex-1 grid-cols-2 gap-6 xl:grid">
        <Pill label="ACTIVE ASSESSMENT" value={ORG.activeAssessment} accent="gold" />
        <Pill label="AFFIRMATION DUE" value={ORG.affirmationDue} accent="amber" />
      </div>
      <div className="flex-1 xl:hidden" />

      <div className="hidden items-center gap-2 border border-ink-700 bg-ink-900 px-3 py-1.5 md:flex">
        <Search size={14} className="text-bone-400" />
        <input
          placeholder="Search controls, evidence, POA&Ms…"
          className="w-64 bg-transparent text-sm text-bone-100 placeholder:text-bone-400 focus:outline-none"
        />
        <span className="font-mono text-[10px] text-bone-400 border border-ink-700 px-1.5 py-0.5">⌘K</span>
      </div>

      <span
        className={`hidden md:inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] tracking-widest2 ${badge.className}`}
        title={`Role: ${role}`}
      >
        <RoleIcon size={11} />
        {badge.label}
      </span>

      <button
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center border border-ink-700 text-bone-300 hover:border-gold-300/60 hover:text-gold-300"
      >
        <Bell size={14} />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-status-failed" />
      </button>

      <div className="group relative">
        <button className="flex items-center gap-2 border border-ink-700 px-2 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold-300/40 bg-gold-300/10 font-mono text-[11px] text-gold-200">
            {initials}
          </div>
          <div className="hidden text-left md:block">
            <div className="text-xs text-bone-100 max-w-[160px] truncate">{safeEmail}</div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-bone-400">
              {mfaMethod === "webauthn" ? (
                <><KeyRound size={9} /> WEBAUTHN</>
              ) : (
                <><Smartphone size={9} /> TOTP</>
              )}
            </div>
          </div>
          <ChevronDown size={12} className="text-bone-400" />
        </button>

        <div className="invisible absolute right-0 top-full mt-1 w-56 border border-ink-700 bg-ink-900 p-1 opacity-0 shadow-gilt transition group-hover:visible group-hover:opacity-100">
          <a
            href="/auth/logout"
            className="flex items-center gap-2 border-l-2 border-transparent px-3 py-2 text-xs text-bone-200 hover:border-gold-300 hover:bg-ink-800"
          >
            <LogOut size={12} />
            Sign out
          </a>
        </div>
      </div>
    </header>
  );
}

function Pill({ label, value, accent }: { label: string; value: string; accent: "gold" | "amber" }) {
  const accentClass =
    accent === "gold"
      ? "text-gold-300 border-gold-300/30"
      : "text-status-partial border-status-partial/40";
  return (
    <div className={`flex items-center justify-between gap-3 border px-3 py-1.5 ${accentClass}`}>
      <span className="font-mono text-[10px] tracking-widest2 text-bone-400">{label}</span>
      <span className="font-mono text-xs text-bone-100 truncate">{value}</span>
    </div>
  );
}
