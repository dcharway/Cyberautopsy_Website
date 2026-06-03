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
        {/* Brushed chrome / silver — top-light to bottom-shadow */}
        <linearGradient id="chrome" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#F7F9FA" />
          <stop offset="35%" stopColor="#D5DCE2" />
          <stop offset="65%" stopColor="#A6B0B9" />
          <stop offset="100%" stopColor="#5E6770" />
        </linearGradient>
        <linearGradient id="chrome-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2B313A" stopOpacity="0.4" />
        </linearGradient>
        {/* Electric-cyan waveform glow */}
        <linearGradient id="cyan-glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
      </defs>

      {/* Shield body — chrome fill + rim highlight */}
      <path
        d="M32 6 L52 13 V30 C52 43 43 53 32 58 C21 53 12 43 12 30 V13 Z"
        fill="url(#chrome)"
        stroke="url(#chrome-edge)"
        strokeWidth="1.2"
      />
      {/* Inner soft highlight to suggest 3D bevel */}
      <path
        d="M32 10 L48 16 V30 C48 41 40 49 32 53 C24 49 16 41 16 30 V16 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="0.8"
      />
      {/* ECG / heartbeat waveform — diagnostic signature */}
      <path
        d="M14 32 H22 L26 24 L30 40 L34 18 L38 38 L42 28 H50"
        fill="none"
        stroke="url(#cyan-glow)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Subtle waveform glow underlay */}
      <path
        d="M14 32 H22 L26 24 L30 40 L34 18 L38 38 L42 28 H50"
        fill="none"
        stroke="#22D3EE"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.18"
      />
    </svg>
  );
}
