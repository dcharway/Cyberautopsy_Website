export const metadata = {
  title: "Subscription Terms — CyberAutopsy",
  description:
    "Billing, cancellation, renewal, upgrade / downgrade, and access terms for CyberAutopsy GRC subscriptions."
};

export default function SubscriptionTerms() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24">
      <span className="classified-stamp">LEGAL · SUBSCRIPTION TERMS</span>
      <h1 className="mt-6 font-serif text-4xl tracking-tightest text-bone-50 sm:text-5xl">
        Subscription terms.
      </h1>
      <p className="mt-3 text-xs text-bone-400">Last updated: reflects the current billing model.</p>

      <div className="mt-10 space-y-8 text-bone-200 leading-relaxed">
        <Section title="1. Billing frequency">
          Starter and Professional plans are billed monthly in advance. Enterprise plans are billed
          according to the terms of the individual service order. Charges appear on your card as
          &ldquo;CYBERAUTOPSY&rdquo; or &ldquo;STRIPE * CYBERAUTOPSY&rdquo;.
        </Section>

        <Section title="2. Automatic renewal">
          Monthly subscriptions renew automatically on the same calendar day each month until
          cancelled. You will not receive a renewal reminder before each charge; your subscription
          state is always visible on the Account page.
        </Section>

        <Section title="3. Upgrades and downgrades">
          You may upgrade or downgrade at any time from the Stripe billing portal. Upgrades take
          effect immediately with prorated billing; downgrades take effect at the end of the
          current billing period so you keep the higher entitlements you already paid for.
        </Section>

        <Section title="4. Cancellation">
          Cancel at any time from the Stripe billing portal. Your subscription remains active
          through the end of the current billing period, then transitions to expired. You retain
          read access to your account data for 30 days after expiry so you can export it.
        </Section>

        <Section title="5. Failed payments">
          If a renewal fails, Stripe will retry the charge over the following days. Your account
          enters a <em>past due</em> state during this window; feature access continues. If all
          retries fail, the account transitions to <em>unpaid</em> and portal access is suspended
          until payment is resolved.
        </Section>

        <Section title="6. Data access on cancellation or expiry">
          You may request an export of your GRC data (POA&amp;Ms, evidence records, control
          overrides, checklists, engagement metadata) at any time while your subscription is active
          and for 30 days after expiry. Requests received after 30 days may not be recoverable.
        </Section>

        <Section title="7. Access entitlements">
          Feature access is gated by the plan you subscribe to. See the Plans page for the
          per-plan capability matrix. Enterprise-tier features (API access, custom frameworks,
          dedicated support) are activated on your account after the service order is signed.
        </Section>

        <Section title="8. Payment processor">
          Payments are processed by Stripe, Inc. CyberAutopsy does not store card details on our
          servers. Stripe&rsquo;s security and privacy policies apply to card handling; see{" "}
          <a
            href="https://stripe.com/privacy"
            className="text-gold-300 hover:text-gold-100 underline"
            target="_blank"
            rel="noreferrer"
          >
            stripe.com/privacy
          </a>
          .
        </Section>

        <Section title="9. Changes to pricing or terms">
          We will notify subscribers via email at least 30 days before any material change to
          pricing or subscription terms. Continued use of the service after the change takes
          effect constitutes acceptance.
        </Section>

        <Section title="10. Contact">
          For subscription or billing questions, contact us via the{" "}
          <a href="/contact" className="text-gold-300 hover:text-gold-100 underline">
            contact form
          </a>{" "}
          or by replying to any invoice email.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl text-bone-50">{title}</h2>
      <div className="mt-3 text-sm">{children}</div>
    </section>
  );
}
