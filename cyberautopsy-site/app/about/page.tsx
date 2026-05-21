import Link from "next/link";

export const metadata = {
  title: "About — Former C3PAOs Who Sit on Your Side of the Table",
  description:
    "We were C3PAOs. We saw good companies fail for dumb reasons. CyberAutopsy is the firm we wished existed when we sat on the other side of the assessment."
};

export default function About() {
  return (
    <>
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:px-10 lg:pt-32 lg:pb-28">
          <span className="classified-stamp">FIRM &middot; ABOUT</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            We were the assessor.
            <br />
            <span className="gold-text">Now we sit on your side of the table.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            CyberAutopsy was founded by lead assessors and former CISOs from inside the Defense
            Industrial Base. We have read packets that should have passed and watched them fail
            because the contractor never met an assessor before audit day. That is the problem we
            built the firm to solve.
          </p>
        </div>
      </section>

      <section className="bg-ink-900 py-24 lg:py-32 border-b border-ink-700/60">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <span className="classified-stamp">FOUNDER STORY</span>
          <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
            A $30M company. <span className="gold-text">A two-week findings report.</span>
          </h2>

          <div className="mt-8 space-y-6 text-bone-200">
            <p>
              In the spring of 2023, I (M. Okafor) was the lead assessor on a C3PAO engagement for a
              $30M defense manufacturer in the Mid-Atlantic. The CEO had built the company over two
              decades. The CIO had a degree in mechanical engineering and a side-of-desk security
              function. They had bought a CMMC &ldquo;readiness platform&rdquo; for $80,000 the year before.
            </p>
            <p>
              They failed in week two of the assessment. Not because their security was bad — it was
              fine — but because their evidence was unreadable. The SSP was generated from a tool.
              The artifacts were tagged by IT system, not by control. The CIO had to translate every
              question into a screenshot search. The audit window expired before we got through the
              Access Control family.
            </p>
            <p>
              The contracting officer pulled the award two months later. The CEO laid off 40
              people. The IT director quit. The company is still trading, but as a sub on smaller
              awards. It did not need to happen.
            </p>
            <p>
              I left assessment six weeks after that engagement. CyberAutopsy is the firm I wished
              had been sitting next to that CEO. We build the packet the way the assessor reads it,
              we run the engagement the way the assessor runs the engagement, and we tell the truth
              about what is missing the day we walk in.
            </p>
            <p className="border-l-2 border-gold-300 pl-5 italic text-bone-50">
              &ldquo;Good companies do not fail CMMC because they have bad security. They fail because
              they have unreadable evidence. We fix the evidence.&rdquo;
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
              role="Lead Compliance Surgeon"
              prior="DCMA Industrial Security"
              body="Ten years as a DCMA Industrial Security Specialist. Trained on NIST 800-171 from inside the government inspection regime."
            />
            <Bio
              name="K. Iwu"
              role="Partner, Audit Escort Practice"
              prior="Former Lead Assessor"
              body="40+ C3PAO engagements sat from the assessor side. Now runs our Audit Escort engagements where firms need someone in the room."
            />
          </div>
        </div>
      </section>

      {/* CREDENTIALS / TRUST */}
      <section className="bg-ink-900 py-20 lg:py-24 border-b border-ink-700/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Trust k="RPO" v="CMMC-AB Registered Provider Organization" />
            <Trust k="C3PAO partnerships" v="Three accredited C3PAOs on retainer" />
            <Trust k="Compliance trained" v="CCP, CCA, CISSP, CISM held by partners" />
            <Trust k="Service area" v="United States, all DoD industrial base" />
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
            <PressItem date="Jan 2026" outlet="NDIA Cyber Symposium" title="Panelist: Subcontractor flow-down in the new DFARS clauses" />
            <PressItem date="Oct 2025" outlet="Defense One" title="Op-ed: The contractor pipeline cannot survive a soft enforcement year" />
            <PressItem date="Aug 2025" outlet="AFCEA TechNet Cyber" title="Tabletop: An Audit Escort engagement, narrated" />
          </ul>
        </div>
      </section>

      <section id="careers" className="bg-ink-900 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <span className="classified-stamp">CAREERS</span>
          <h2 className="mt-6 font-serif text-4xl tracking-tightest">
            We are hiring <span className="gold-text">surgeons.</span>
          </h2>
          <p className="mt-5 text-bone-300 max-w-prose2 mx-auto">
            If you have led a C3PAO assessment, sat on the DoD assessment side, or held a CISO seat
            at a contractor under DFARS clauses, we want to talk. Compensation is partner-grade,
            travel is real, and engagements are signed by you.
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
