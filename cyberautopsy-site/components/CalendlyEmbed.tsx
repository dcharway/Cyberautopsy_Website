"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CalendarClock, Copy, ExternalLink, Mail } from "lucide-react";

/**
 * Calendly inline embed using the official widget script (better than a
 * plain iframe — supports prefill, responsive sizing, event callbacks).
 *
 * URL precedence:
 *   1. NEXT_PUBLIC_CALENDLY_URL  (set in cyberautopsy-site/.env.local)
 *   2. The `fallbackUrl` prop
 *   3. A graceful "not configured" panel
 *
 * Visitor bookings sync automatically to whatever calendar the host has
 * connected in Calendly Settings → Calendar Connections. Email
 * confirmations + .ics calendar invites + reminders are dispatched by
 * Calendly itself.
 */

type Props = {
  /** Fallback URL if the env var is not set. */
  fallbackUrl?: string;
  /** Optional pre-fill: visitor email, name, custom answers. */
  prefill?: {
    email?: string;
    name?: string;
    customAnswers?: Record<string, string>;
  };
  /** Override the iframe height (in px). */
  height?: number;
  /** Show the gold border + classified-stamp label. Defaults to true. */
  branded?: boolean;
};

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (config: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, unknown>;
      }) => void;
    };
  }
}

export function CalendlyEmbed({ fallbackUrl, prefill, height = 720, branded = true }: Props) {
  const url = (process.env.NEXT_PUBLIC_CALENDLY_URL || fallbackUrl || "").trim();
  const [copied, setCopied] = useState(false);

  // Re-init the widget when the script loads or the URL changes
  useEffect(() => {
    if (!url) return;
    if (typeof window === "undefined") return;
    const el = document.querySelector<HTMLDivElement>("[data-calendly-target]");
    if (!el) return;
    function tryInit() {
      if (window.Calendly?.initInlineWidget) {
        // Clear any prior widget content so re-init doesn't stack iframes
        el!.innerHTML = "";
        window.Calendly.initInlineWidget({
          url,
          parentElement: el!,
          prefill: prefill
            ? {
                name: prefill.name,
                email: prefill.email,
                customAnswers: prefill.customAnswers
              }
            : undefined
        });
      } else {
        // Script may not have loaded yet — retry once next tick
        setTimeout(tryInit, 100);
      }
    }
    tryInit();
  }, [url, prefill]);

  if (!url) return <NotConfiguredPanel />;

  const wrapperClass = branded
    ? "border border-gold-300/40 bg-ink-900 p-1 shadow-gilt"
    : "border border-ink-700 bg-ink-950 p-1";

  return (
    <div className={wrapperClass}>
      {/* Official Calendly widget loader */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== "undefined" && window.Calendly?.initInlineWidget) {
            const el = document.querySelector<HTMLDivElement>("[data-calendly-target]");
            if (el) {
              el.innerHTML = "";
              window.Calendly.initInlineWidget({
                url,
                parentElement: el,
                prefill: prefill
                  ? {
                      name: prefill.name,
                      email: prefill.email,
                      customAnswers: prefill.customAnswers
                    }
                  : undefined
              });
            }
          }
        }}
      />
      <link
        rel="stylesheet"
        href="https://assets.calendly.com/assets/external/widget.css"
      />

      <div
        data-calendly-target
        style={{ minWidth: "320px", height: `${height}px` }}
      />

      <div className="border-t border-ink-700 px-4 py-3 flex items-center justify-between gap-3 text-[11px] text-bone-400">
        <span className="font-mono uppercase tracking-widest">
          POWERED BY CALENDLY · SYNCS TO HOST CALENDAR
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(url).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            }}
            className="inline-flex items-center gap-1 hover:text-gold-300"
            aria-label="Copy booking URL"
          >
            <Copy size={11} />
            {copied ? "COPIED" : "COPY LINK"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-gold-300"
          >
            <ExternalLink size={11} />
            OPEN IN NEW TAB
          </a>
        </div>
      </div>
    </div>
  );
}

function NotConfiguredPanel() {
  return (
    <div className="border border-gold-300/40 bg-ink-900 p-8 shadow-gilt">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-gold-300">
        <CalendarClock size={12} />
        BOOKING SYSTEM PENDING SETUP
      </div>
      <h3 className="mt-3 font-serif text-2xl text-bone-50">
        Calendar booking not yet configured.
      </h3>
      <p className="mt-3 text-sm text-bone-300 max-w-prose2">
        Online scheduling will be available shortly. While we finish wiring it up, send a note to{" "}
        <a href="mailto:dtwum@cyberautopsy.org" className="text-gold-300 hover:text-gold-100">
          dtwum@cyberautopsy.org
        </a>{" "}
        with two preferred 15-minute windows and we&rsquo;ll confirm by return email.
      </p>
      <div className="mt-6 border-t border-ink-700 pt-5 grid gap-3 sm:grid-cols-2 text-sm text-bone-200">
        <a
          href="mailto:dtwum@cyberautopsy.org"
          className="inline-flex items-center gap-2 border border-gold-300/40 bg-gold-300/5 px-4 py-3 text-gold-100 hover:bg-gold-300 hover:text-ink-950"
        >
          <Mail size={14} />
          dtwum@cyberautopsy.org
        </a>
        <a
          href="tel:+14432442977"
          className="inline-flex items-center gap-2 border border-ink-700 px-4 py-3 text-bone-200 hover:border-bone-300"
        >
          +1 (443) 244-2977
        </a>
      </div>
    </div>
  );
}
