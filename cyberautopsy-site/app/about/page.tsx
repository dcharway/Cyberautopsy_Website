import Link from "next/link";

export const metadata = {
  title: "About — Cybersecurity, Risk, and Technology Consulting Firm",
  description:
    "CyberAutopsy is a cybersecurity, GRC, cloud, and workforce services firm serving federal agencies, defense contractors, regulated organizations, and commercial businesses. Founded by former DoD assessors, CISOs, and engineering leaders."
};

export default function About() {
  return (
    <>
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:px-10 lg:pt-32 lg:pb-28">
          <span className="classified-stamp">FIRM &middot; ABOUT</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            Cybersecurity, risk, and technology consulting —{" "}
            <span className="gold-text">delivered by senior operators.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            CyberAutopsy is a cybersecurity, governance, and technology services firm. We help
            federal agencies, defense contractors, regulated organizations, and commercial
            businesses build security programs that are risk-based, framework-aligned, and
            defensible under audit. Our practices span cybersecurity and GRC, cloud and technology
            modernization, custom GRC engineering, cloud and AI adoption, mission support, and
            workforce development.
          </p>
        </div>
      </section>

      <section className="bg-ink-900 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <span className="classified-stamp">FIRM STORY</span>
          <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
            Founded by people who lived on{" "}
            <span className="gold-text">both sides of the audit.</span>
          </h2>

          <div className="mt-8 space-y-6 text-bone-200">
            <p>
              The firm was founded by former DoD assessors, CISOs from the Defense Industrial Base,
              and cloud and data engineers who had watched too many well-run companies stumble at
              the moment their program had to prove itself. The pattern was consistent — the
              security work was often adequate, but the program had been built to a checklist
              instead of to the underlying risk.
            </p>
            <p>
              We built CyberAutopsy on a different premise. Start with the risk that actually
              matters to the mission or the business. Instrument the program so posture is
              observable between audits, not just during them. Build the evidence the way an
              assessor reads it. Sit next to the client when it counts. Frameworks — NIST, CMMC,
              FedRAMP, ISO 27001, SOC 2, HIPAA — follow from that discipline, not the other way
              around.
            </p>
            <p>
              Today our practice serves federal missions and commercial enterprises alike. We staff
              engagements with senior practitioners across cybersecurity, GRC, cloud, data, AI, and
              workforce development. The delivery model stays the same: fixed scope, measurable
              outcome, no juniors on the account.
            </p>
            <p className="border-l-2 border-gold-300 pl-5 italic text-bone-50">
              &ldquo;Checklist compliance is fragile. Risk-based programs hold up. We build the
              second kind.&rdquo;
            </p>
            <p className="text-sm text-bone-400">— M. Okafor, Founder &amp; Managing Partner</p>
          </div>
        </div>
      </section>

      <section className="bg-ink-950 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <span className="classified-stamp">PARTNERS</span>
            <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
              No juniors. <span className="gold-text">No subcontracted judgment.</span>
            </h2>
            <p className="mt-5 text-bone-300 max-w-prose2">
              Every engagement is signed by a partner. The person you meet on the triage call is the
              person who reads the Assessment Packet on the last day.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Bio
              name="M. Okafor"
              role="Founder &amp; Managing Partner"
              prior="Lead Assessor, CMMC-AB authorized C3PAO"
              body="60+ C3PAO assessments led across primes and subcontractors. Prior to assessment, 12 years inside DCMA and DCSA. CISSP, CCP, CCA."
            />
            <Bio
              name="A. Sterling"
              role="Director, Compliance Engineering"
              prior="CISO, Tier-1 Prime"
              body="Built and operated the CUI enclave for a $1.2B program of record. 18 years in defense IT, focused on cryptographic boundaries and identity."
            />
            <Bio
              name="R. Vasquez"
              role="Lead Cloud & Data Engineering"
              prior="Enterprise Cloud Architect"
              body="Cloud-native architectures, Zero Trust identity, and data platform engineering across AWS, Azure, and GCP for federal and commercial clients."
            />
            <Bio
              name="K. Iwu"
              role="Partner, GRC Engineering &amp; Workforce"
              prior="Former Lead Assessor"
              body="40+ assessment engagements. Now leads custom GRC platform build-outs and the firm&rsquo;s workforce development curriculum."
            />
          </div>
        </div>
      </section>

      {/* CREDENTIALS / TRUST */}
      <section className="bg-ink-900 py-20 lg:py-24 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Trust k="Frameworks" v="NIST, CMMC, FedRAMP, ISO 27001, SOC 2, HIPAA" />
            <Trust k="Practices" v="Cyber · GRC · Cloud · AI · Mission · Workforce" />
            <Trust k="Credentials" v="CISSP, CISM, CCP, CCA, cloud certifications" />
            <Trust k="Service area" v="United States — federal, defense, regulated, commercial" />
          </div>
        </div>
      </section>

      <section id="press" className="bg-ink-950 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <span className="classified-stamp">PRESS &amp; SPEAKING</span>
          <h2 className="mt-6 font-serif text-4xl tracking-tightest">
            Where we&rsquo;ve <span className="gold-text">said it out loud.</span>
          </h2>
          <ul className="mt-10 divide-y divide-ink-700">
            <PressItem date="Mar 2026" outlet="Federal News Network" title="Why most CMMC POA&Ms are written wrong" />
            <PressItem date="Jan 2026" outlet="NDIA Cyber Symposium" title="Panelist: Third-party and supply-chain risk under Zero Trust" />
            <PressItem date="Oct 2025" outlet="Defense One" title="Op-ed: Risk-based security beats checklist compliance every time" />
            <PressItem date="Aug 2025" outlet="AFCEA TechNet Cyber" title="Session: Custom GRC engineering for federal missions" />
          </ul>
        </div>
      </section>

      <section id="careers" className="bg-ink-900 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <span className="classified-stamp">CAREERS</span>
          <h2 className="mt-6 font-serif text-4xl tracking-tightest">
            We are hiring <span className="gold-text">senior practitioners.</span>
          </h2>
          <p className="mt-5 text-bone-300 max-w-prose2 mx-auto">
            Across cybersecurity, GRC, cloud, data, AI, and workforce development. If you have held
            a CISO seat, led federal authorization work, engineered cloud-native systems, built
            GRC platforms, or run enterprise-grade training programs, we want to talk. No juniors
            on the account — engagements are signed by you.
          </p>
          <Link href="mailto:careers@cyberautopsy.com" className="mt-10 inline-block bg-gold-300 px-6 py-4 text-sm font-medium text-ink-950 hover:bg-gold-200">
            careers@cyberautopsy.com &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}

function Bio({ name, role, prior, body }: { name: string; role: string; prior: string; body: string }) {
  return (
    <div className="border border-ink-700 bg-ink-900 p-8">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 border border-gold-300/40 bg-gold-300/5" aria-hidden />
        <div>
          <div className="font-serif text-xl text-bone-50">{name}</div>
          <div className="text-[11px] uppercase tracking-widest text-bone-400" dangerouslySetInnerHTML={{ __html: role }} />
          <div className="mt-1 text-[10px] uppercase tracking-widest text-gold-300">PRIOR &middot; {prior}</div>
        </div>
      </div>
      <p className="mt-5 text-sm text-bone-300">{body}</p>
    </div>
  );
}

function Trust({ k, v }: { k: string; v: string }) {
  return (
    <div className="border border-ink-700 bg-ink-950 p-5">
      <div className="font-mono text-[11px] tracking-widest2 text-gold-300">{k}</div>
      <div className="mt-2 text-sm text-bone-100">{v}</div>
    </div>
  );
}

function PressItem({ date, outlet, title }: { date: string; outlet: string; title: string }) {
  return (
    <li className="grid gap-2 py-5 lg:grid-cols-[120px_180px_1fr]">
      <span className="font-mono text-[11px] tracking-widest2 text-gold-300">{date}</span>
      <span className="font-mono text-[11px] tracking-widest2 text-bone-400">{outlet}</span>
      <span className="text-bone-100">{title}</span>
    </li>
  );
}
