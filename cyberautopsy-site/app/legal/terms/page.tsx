import { SITE } from "@/lib/utils";

export const metadata = {
  title: "Terms of Use",
  description: "Terms governing your use of the CyberAutopsy website. Engagements are governed by separate signed engagement letters."
};

export default function Terms() {
  return (
    <>
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-4xl px-6 pt-24 pb-12 lg:px-10">
          <span className="classified-stamp">LEGAL</span>
          <h1 className="mt-8 font-serif text-4xl tracking-tightest sm:text-5xl">Terms of Use</h1>
          <p className="mt-4 font-mono text-[11px] tracking-widest2 text-bone-400">
            EFFECTIVE 2026-01-01 &middot; LAST UPDATED 2026-05-15
          </p>
        </div>
      </section>

      <section className="bg-ink-950 py-16 lg:py-20">
        <article className="prose-article mx-auto px-6 lg:px-10">
          <p>
            These Terms of Use govern your access to and use of the CyberAutopsy.com website. By
            using the site you agree to these terms. They do not govern engagements; client
            engagements are subject to a separate executed engagement letter.
          </p>

          <h2>Informational content only</h2>
          <p>
            The content of this site is provided for general informational purposes. Nothing on the
            site constitutes legal advice, formal compliance guidance, or a contractual commitment.
            CMMC and DFARS regulations are subject to change; readers are responsible for confirming
            the current state of the law with respect to their own contracts.
          </p>

          <h2>No attorney-client relationship</h2>
          <p>
            CyberAutopsy is a cybersecurity compliance firm. We are not a law firm and do not
            practice law. Use of this site does not create an attorney-client or accountant-client
            relationship.
          </p>

          <h2>Intellectual property</h2>
          <p>
            All text, graphics, code, and other content on this site are the property of CyberAutopsy
            LLC or are used with permission. The CyberAutopsy mark and wordmark are trademarks of
            CyberAutopsy LLC. You may quote excerpts from this site with proper attribution; you may
            not reproduce material commercially without written permission.
          </p>

          <h2>External links</h2>
          <p>
            This site may link to third-party sites operated by independent parties, including
            DIBNet, the Cyber AB, NIST, and DoD. We do not control and are not responsible for the
            content of third-party sites.
          </p>

          <h2>No warranty</h2>
          <p>
            The site is provided &ldquo;as is&rdquo; without warranties of any kind, express or
            implied, including warranties of merchantability, fitness for a particular purpose, and
            non-infringement. We do not warrant that the site will be uninterrupted, error-free, or
            free of malicious code.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, CyberAutopsy LLC will not be liable for any
            indirect, incidental, consequential, special, or exemplary damages arising from your use
            of this site. Total aggregate liability arising from your use of the site is limited to
            one hundred U.S. dollars (USD $100).
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of the Commonwealth of Virginia, without regard to
            its conflict-of-laws principles. Disputes arising from your use of this site are subject
            to the exclusive jurisdiction of the state and federal courts located in Northern
            Virginia.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the site after an update
            constitutes acceptance of the updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </article>
      </section>
    </>
  );
}
