"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/cmmc-level-2", label: "CMMC Level 2" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "The Method" },
  { href: "/industries", label: "Industries" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="CyberAutopsy home">
          <Mark />
          <div className="leading-none">
            <span className="block font-serif text-[19px] tracking-tightest">CyberAutopsy</span>
            <span className="block font-mono text-[9px] tracking-widest2 text-gold-300/80">
              SHIELD &middot; COMPLIANCE
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-bone-200 transition hover:text-gold-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest2 text-bone-300 transition hover:text-gold-300"
          >
            <LogIn size={12} />
            Client Portal
          </Link>
          <span className="h-4 w-px bg-ink-700" aria-hidden />
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-gold-300/40 bg-gold-300/5 px-5 py-2.5 text-sm font-medium text-gold-100 transition hover:bg-gold-300 hover:text-ink-950"
          >
            Book Contract Risk Audit
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="lg:hidden text-bone-100"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          "lg:hidden border-t border-ink-700/70 overflow-hidden transition-[max-height] duration-300",
          open ? "max-h-[420px]" : "max-h-0"
        )}
      >
        <div className="px-6 py-4 flex flex-col gap-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-base text-bone-100 py-1"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/portal"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 border border-ink-700 px-4 py-3 text-sm text-bone-100"
          >
            <LogIn size={14} /> Client Portal
          </Link>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center border border-gold-300/40 bg-gold-300/10 px-4 py-3 text-sm font-medium text-gold-100"
          >
            Book Contract Risk Audit &rarr;
          </Link>
        </div>
      </div>
    </header>
  );
}

function Mark() {
  return (
    <svg width="32" height="32" viewBox="0 0 64 64" aria-hidden focusable="false">
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2E6B5" />
          <stop offset="55%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8C6E1F" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="none" stroke="url(#gold)" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="url(#gold)" strokeWidth="0.6" opacity="0.4" />
      {/* shield */}
      <path
        d="M32 14 L46 20 V32 C46 41 39 47 32 50 C25 47 18 41 18 32 V20 Z"
        fill="none"
        stroke="url(#gold)"
        strokeWidth="1.4"
      />
      {/* scalpel through shield */}
      <line x1="22" y1="44" x2="44" y2="22" stroke="url(#gold)" strokeWidth="1.2" />
      <circle cx="22" cy="44" r="1.6" fill="url(#gold)" />
    </svg>
  );
}
