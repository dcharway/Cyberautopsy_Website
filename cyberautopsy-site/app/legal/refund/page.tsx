export const metadata = {
  title: "Refund Policy — CyberAutopsy",
  description: "CyberAutopsy GRC subscription refund policy."
};

export default function RefundPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24">
      <span className="classified-stamp">LEGAL · REFUND POLICY</span>
      <h1 className="mt-6 font-serif text-4xl tracking-tightest text-bone-50 sm:text-5xl">
        Refund policy.
      </h1>

      <div className="mt-10 space-y-6 text-bone-200 leading-relaxed">
        <p>
          CyberAutopsy GRC subscriptions are billed monthly in advance. Because access to the
          platform activates immediately after payment clears and provisioned capacity begins
          consumption on day one, the following refund terms apply.
        </p>

        <Section title="7-day full refund">
          If you cancel within 7 days of your first paid subscription, we will refund that first
          charge in full — no questions asked. Access ends immediately upon cancellation. Contact
          us via the{" "}
          <a href="/contact" className="text-gold-300 hover:text-gold-100 underline">
            contact form
          </a>{" "}
          to request this refund; it will be processed to the original payment method within 5–10
          business days.
        </Section>

        <Section title="Renewal charges">
          Subsequent monthly renewals are non-refundable. You may cancel at any time to prevent
          the next renewal from being charged; see our{" "}
          <a href="/legal/subscription" className="text-gold-300 hover:text-gold-100 underline">
            subscription terms
          </a>{" "}
          for the cancellation process. Access remains available until the end of the paid period.
        </Section>

        <Section title="Failed features or service disruption">
          If the platform is materially unavailable for more than 24 consecutive hours in a billing
          period, or a purchased feature fails to function as documented and is not remedied within
          10 business days, we will credit your next invoice on a prorated basis. Enterprise
          service orders may specify additional SLA remedies.
        </Section>

        <Section title="Enterprise plans">
          Enterprise plans follow the refund and credit terms specified in the individual service
          order signed with your organization.
        </Section>

        <Section title="Payment processor">
          Refunds are issued through Stripe to the original payment method. Timing to appear on your
          statement depends on your card issuer, typically 5–10 business days.
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
