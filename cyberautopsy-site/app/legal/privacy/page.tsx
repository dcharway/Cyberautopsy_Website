import { SITE } from "@/lib/utils";

export const metadata = {
  title: "Privacy Policy",
  description: "How CyberAutopsy collects, uses, and protects information submitted through this site and in client engagements."
};

export default function Privacy() {
  return (
    <>
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-4xl px-6 pt-24 pb-12 lg:px-10">
          <span className="classified-stamp">LEGAL</span>
          <h1 className="mt-8 font-serif text-4xl tracking-tightest sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 font-mono text-[11px] tracking-widest2 text-bone-400">
            EFFECTIVE 2026-01-01 &middot; LAST UPDATED 2026-05-15
          </p>
        </div>
      </section>

      <section className="bg-ink-950 py-16 lg:py-20">
        <article className="prose-article mx-auto px-6 lg:px-10">
          <p>
            CyberAutopsy LLC (&ldquo;CyberAutopsy,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) operates this
            site at cyberautopsy.com. This policy describes what information we collect, how we use
            it, and how we protect it. We work with Department of Defense contractors who handle
            Controlled Unclassified Information (CUI); this policy is written with that audience in
            mind.
          </p>

          <h2>Information we collect</h2>
          <p>
            We collect the minimum information required to deliver our services. Specifically:
          </p>
          <ul>
            <li>
              <strong>Contact submissions:</strong> Name, work email, company, CAGE code, role,
              contract value at risk, and CUI handling status submitted through the Contract Risk
              Audit form or the gated brief.
            </li>
            <li>
              <strong>Calendly bookings:</strong> Name, email, calendar slot, and any notes you
              provide. Calendly is a separate processor with its own terms.
            </li>
            <li>
              <strong>Engagement data:</strong> Material you provide under engagement, including
              system documentation and artifacts. This is treated as confidential and, where the
              engagement involves CUI, is handled inside a CUI-compliant boundary.
            </li>
            <li>
              <strong>Server logs:</strong> IP address, user agent, and request path, retained no
              longer than 30 days for diagnostic purposes.
            </li>
          </ul>

          <h2>How we use information</h2>
          <ul>
            <li>To respond to inquiries and route them to the appropriate partner.</li>
            <li>To deliver contracted services and the deliverables described in the engagement letter.</li>
            <li>To meet our own legal and regulatory obligations.</li>
          </ul>
          <p>
            We do not sell information. We do not share information with third parties for their own
            marketing. We do not use information for behavioral advertising.
          </p>

          <h2>Cookies and analytics</h2>
          <p>
            This site uses strictly necessary first-party cookies to maintain session state. We do
            not use third-party advertising cookies. If analytics are enabled on this site, they are
            configured for first-party, IP-anonymized collection only.
          </p>

          <h2>How we protect information</h2>
          <p>
            CyberAutopsy maintains a security posture aligned with NIST SP 800-171. Engagement data
            classified as CUI is handled inside an authorized CUI boundary maintained by the firm.
            Public-site data (contact form submissions, lead-magnet email captures) is stored in
            commercially reasonable, encrypted infrastructure separate from the CUI boundary.
          </p>

          <h2>Data retention</h2>
          <ul>
            <li>Contact form submissions: 24 months from last interaction, then deleted on request or by policy.</li>
            <li>Engagement records: 7 years from engagement close, consistent with federal contractor record-retention norms.</li>
            <li>Server logs: 30 days.</li>
          </ul>

          <h2>Your rights</h2>
          <p>
            You may request access to or deletion of information we hold about you by emailing{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. We will respond within 30 days. We
            honor requests under applicable U.S. state privacy laws (CCPA, CDPA, CPA, CTDPA, UCPA).
          </p>

          <h2>Contact</h2>
          <p>
            CyberAutopsy LLC &middot; Northern Virginia, United States &middot;{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </article>
      </section>
    </>
  );
}
