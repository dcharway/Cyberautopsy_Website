import { SITE } from "@/lib/utils";

export const metadata = {
  title: "Accessibility Statement",
  description:
    "CyberAutopsy is committed to WCAG 2.1 AA accessibility and Section 508 conformance. Many of our buyers procure under federal accessibility rules; we hold ourselves to the same bar."
};

export default function Accessibility() {
  return (
    <>
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-4xl px-6 pt-24 pb-12 lg:px-10">
          <span className="classified-stamp">LEGAL &middot; WCAG AA &middot; 508</span>
          <h1 className="mt-8 font-serif text-4xl tracking-tightest sm:text-5xl">
            Accessibility Statement
          </h1>
          <p className="mt-4 font-mono text-[11px] tracking-widest2 text-bone-400">
            EFFECTIVE 2026-01-01 &middot; LAST UPDATED 2026-05-15
          </p>
        </div>
      </section>

      <section className="bg-ink-950 py-16 lg:py-20">
        <article className="prose-article mx-auto px-6 lg:px-10">
          <p>
            Many of our buyers are federal contracting officers and federal agencies who procure
            under accessibility rules. We hold ourselves to the same bar. This statement describes
            the conformance posture of cyberautopsy.com and how to reach us if you encounter an
            accessibility issue.
          </p>

          <h2>Conformance target</h2>
          <p>
            CyberAutopsy.com is designed to conform to Web Content Accessibility Guidelines (WCAG)
            2.1 at the AA level, and to align with the technical standards in Section 508 of the
            U.S. Rehabilitation Act, as revised.
          </p>

          <h2>Conformance status</h2>
          <p>
            We assess the site as <strong>partially conformant</strong> with WCAG 2.1 AA. This
            language is used because some content may not yet fully conform; we are working to
            address all gaps. Specifically:
          </p>
          <ul>
            <li>All text meets or exceeds the AA contrast ratio of 4.5:1.</li>
            <li>All interactive elements are reachable by keyboard with a visible focus indicator.</li>
            <li>Color is never the sole signal in data visualizations (heatmaps include proportional bars; SPRS score card includes PASS/FAIL text labels).</li>
            <li>Motion is respected via <code>prefers-reduced-motion</code>; entrance animations collapse to instant for users who request it.</li>
            <li>The site uses semantic HTML and skip-to-content navigation.</li>
            <li>Form labels are programmatically associated with their inputs.</li>
            <li>The hero ambient video is decorative and is paired with text content; an alternative poster image is provided.</li>
          </ul>

          <h2>Known issues</h2>
          <ul>
            <li>
              Some longer-form Resources articles do not yet provide downloadable plain-text
              transcripts. We are adding these to the production pipeline.
            </li>
            <li>
              The Calendly embed on the Contact page is a third-party widget; we rely on the
              provider&apos;s accessibility posture for that surface. If you would prefer to schedule
              by email or phone, see the contact methods below.
            </li>
          </ul>

          <h2>Feedback and escalation</h2>
          <p>
            If you encounter an accessibility barrier on this site, we want to know. We commit to
            responding within five business days and, where feasible, to providing the requested
            content or service through an alternative channel.
          </p>
          <ul>
            <li>Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            <li>Phone: {SITE.phone}</li>
          </ul>

          <h2>Assessment methodology</h2>
          <p>
            We assess conformance through a combination of automated tooling (axe DevTools,
            Lighthouse), manual keyboard-only navigation testing, and screen-reader spot checks
            using NVDA and VoiceOver. Findings are tracked in the same evidence library posture we
            recommend to our clients.
          </p>
        </article>
      </section>
    </>
  );
}
