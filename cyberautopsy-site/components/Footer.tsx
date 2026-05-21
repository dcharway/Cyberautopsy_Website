import Link from "next/link";
import { SITE } from "@/lib/utils";

const cols = [
  {
    title: "Practice",
    links: [
      { href: "/cmmc-level-2", label: "CMMC Level 2" },
      { href: "/services", label: "Services" },
      { href: "/process", label: "The CyberAutopsy Method" },
      { href: "/industries", label: "Industries" }
    ]
  },
  {
    title: "Knowledge",
    links: [
      { href: "/resources", label: "Resources" },
      { href: "/resources#sprs-calculator", label: "SPRS Score Estimator" },
      { href: "/resources#dfars-checklist", label: "DFARS 7012 Checklist" },
      { href: "/resources#self-assessment", label: "Will I Fail? Self-Assessment" }
    ]
  },
  {
    title: "Firm",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/portal", label: "Client Portal" },
      { href: "/about#careers", label: "Careers" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="mt-32 border-t border-ink-700/70 bg-ink-900">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl tracking-tightest">CyberAutopsy</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-bone-300">
              A Registered Provider Organization (RPO) partnered with C3PAOs. We dissect, document, and
              defend your CMMC posture so you stay eligible to compete for DoD work.
            </p>
            <p className="mt-5 font-mono text-[11px] tracking-widest2 text-gold-300/80">
              CMMC-AB REGISTERED &middot; CUI HANDLED
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-mono text-[11px] tracking-widest2 text-bone-400">{c.title}</h4>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-bone-200 hover:text-gold-300">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hairline mt-14" />

        <div className="mt-8 flex flex-col gap-4 text-xs text-bone-400 lg:flex-row lg:items-center lg:justify-between">
          <div>
            &copy; {new Date().getFullYear()} CyberAutopsy LLC. All rights reserved.
            <span className="ml-3 hidden lg:inline">{SITE.email}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-gold-300">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-gold-300">
              Terms
            </Link>
            <Link href="/legal/accessibility" className="hover:text-gold-300">
              Accessibility (WCAG AA &middot; 508)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
