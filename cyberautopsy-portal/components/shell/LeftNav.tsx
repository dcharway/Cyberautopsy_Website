"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  FolderArchive,
  AlertOctagon,
  ClipboardCheck,
  ShieldCheck,
  FileBarChart,
  Settings,
  HelpCircle,
  Lock,
  Building2,
  ClipboardList,
  type LucideIcon
} from "lucide-react";
import { Mark } from "./Mark";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth/session";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  count: number | null;
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/dashboard",      label: "Overview",       icon: LayoutDashboard, count: null },
  { href: "/admin/clients",  label: "Clients",        icon: Building2,       count: null, adminOnly: true },
  { href: "/precmmc",        label: "Pre-CMMC",       icon: ClipboardList,   count: null, adminOnly: true },
  { href: "/controls",       label: "Controls",       icon: ListChecks,      count: 110 },
  { href: "/evidence",       label: "Evidence",       icon: FolderArchive,   count: null },
  { href: "/poam",           label: "POA&M",          icon: AlertOctagon,    count: null },
  { href: "/assessments",    label: "Assessments",    icon: ClipboardCheck,  count: null },
  { href: "/affirmations",   label: "Affirmations",   icon: ShieldCheck,     count: null },
  { href: "/reports",        label: "Reports",        icon: FileBarChart,    count: null, adminOnly: true },
  { href: "/admin",          label: "Admin",          icon: Settings,        count: null, adminOnly: true }
];

export function LeftNav({ role = "viewer" }: { role?: Role }) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-ink-700/70 bg-ink-950 px-3 py-5">
      <div className="flex items-center gap-2 px-3 pb-4">
        <Mark size={28} />
        <div>
          <div className="font-serif text-base tracking-tightest text-bone-50">CyberAutopsy</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-gold-300/80">
            GRC PORTAL · CMMC L2
          </div>
        </div>
      </div>

      <div className="hairline mx-3" />

      <nav className="mt-4 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const locked = item.adminOnly && !isAdmin;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-disabled={locked}
              title={locked ? "Admin only" : undefined}
              className={cn(
                "group flex items-center justify-between rounded-sm px-3 py-2 text-sm transition border-l-2",
                active
                  ? "bg-gold-300/10 text-gold-100 border-gold-300"
                  : locked
                  ? "text-bone-500 border-transparent hover:bg-ink-900/50 cursor-not-allowed"
                  : "text-bone-300 hover:bg-ink-900 hover:text-bone-100 border-transparent"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon
                  size={15}
                  className={cn(
                    active
                      ? "text-gold-300"
                      : locked
                      ? "text-bone-500"
                      : "text-bone-400 group-hover:text-bone-200"
                  )}
                />
                {item.label}
              </span>
              {locked ? (
                <Lock size={11} className="text-bone-500" />
              ) : item.count !== null ? (
                <span
                  className={cn(
                    "font-mono text-[10px] px-1.5 py-0.5 border",
                    active ? "border-gold-300/40 text-gold-200" : "border-ink-700 text-bone-400"
                  )}
                >
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-3 right-3">
        {isAdmin ? (
          <div className="border border-ink-700 bg-ink-900 p-3">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest2 text-gold-300">
              <HelpCircle size={12} />
              ASSESSOR HANDOFF
            </div>
            <p className="mt-2 text-xs text-bone-300 leading-snug">
              Pre-build the C3PAO Assessment Packet from current state in one click.
            </p>
            <Link
              href="/reports"
              className="mt-3 inline-block border border-gold-300/40 px-2 py-1 text-[11px] text-gold-100 hover:bg-gold-300 hover:text-ink-950"
            >
              Build packet →
            </Link>
          </div>
        ) : (
          <div className="border border-status-review/40 bg-status-reviewBg/50 p-3">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest2 text-status-review">
              <Lock size={12} />
              DEMO ACCESS
            </div>
            <p className="mt-2 text-xs text-bone-300 leading-snug">
              Assessment workflow, evidence uploads, and packet generation are admin-only.
            </p>
            <Link
              href="https://www.cyberautopsy.org/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block border border-gold-300/40 px-2 py-1 text-[11px] text-gold-100 hover:bg-gold-300 hover:text-ink-950"
            >
              Request access →
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
