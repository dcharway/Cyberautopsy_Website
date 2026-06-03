import Link from "next/link";
import { Info } from "lucide-react";

/**
 * Persistent banner shown to demo-role sessions. Sets expectations: read-only
 * showcase, admin-only features locked. Sticky directly below the top bar.
 */
export function DemoBanner() {
  return (
    <div className="sticky top-16 z-20 border-b border-status-review/40 bg-status-reviewBg/40 px-6 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs text-bone-200">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-status-review shrink-0" />
          <span>
            <strong className="text-bone-50">Demo session.</strong> Browsing in read-only mode —
            assessment workflow, evidence uploads, and report exports are admin-only.
          </span>
        </div>
        <Link
          href="https://www.cyberautopsy.org/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden font-mono text-[10px] uppercase tracking-widest text-gold-300 hover:text-gold-100 sm:inline-block"
        >
          Talk to a partner →
        </Link>
      </div>
    </div>
  );
}
