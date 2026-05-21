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
  HelpCircle
} from "lucide-react";
import { Mark } from "./Mark";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, count: null },
  { href: "/controls", label: "Controls", icon: ListChecks, count: 110 },
  { href: "/evidence", label: "Evidence", icon: FolderArchive, count: 92 },
  { href: "/poam", label: "POA&M", icon: AlertOctagon, count: 8 },
  { href: "/assessments", label: "Assessments", icon: ClipboardCheck, count: null },
  { href: "/affirmations", label: "Affirmations", icon: ShieldCheck, count: null },
  { href: "/reports", label: "Reports", icon: FileBarChart, count: null },
  { href: "/admin", label: "Admin", icon: Settings, count: null }
];

export function LeftNav() {
  const pathname = usePathname();
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
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-sm px-3 py-2 text-sm transition",
                active
                  ? "bg-gold-300/10 text-gold-100 border-l-2 border-gold-300"
                  : "text-bone-300 hover:bg-ink-900 hover:text-bone-100 border-l-2 border-transparent"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon size={15} className={active ? "text-gold-300" : "text-bone-400 group-hover:text-bone-200"} />
                {item.label}
              </span>
              {item.count !== null && (
                <span
                  className={cn(
                    "font-mono text-[10px] px-1.5 py-0.5 border",
                    active
                      ? "border-gold-300/40 text-gold-200"
                      : "border-ink-700 text-bone-400"
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-3 right-3">
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
      </div>
    </aside>
  );
}
