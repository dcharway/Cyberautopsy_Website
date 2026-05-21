"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-ink-700/60">
      {/* Background video */}
      <div className="absolute inset-0 -z-20">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero-poster.jpg"
          className="h-full w-full object-cover opacity-40"
        >
          <source src="/cyberautopsy_video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950" />
      <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-30" />

      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:px-10 lg:pt-32 lg:pb-36">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-3">
            <span className="classified-stamp">RPO &middot; PARTNERED WITH C3PAOs</span>
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest2 text-bone-400">
              EST. WASHINGTON METRO &middot; CMMC 2.0 READY
            </span>
          </div>

          <h1 className="mt-10 font-serif text-5xl leading-[1.02] tracking-tightest sm:text-6xl lg:text-7xl">
            CMMC Level 2 Certification.
            <br />
            <span className="gold-text">Guaranteed.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-200 sm:text-xl">
            For DoD contractors who cannot afford to lose the next award. We diagnose your
            environment against the 110 controls of NIST 800-171, remediate with your team, and sit
            beside you through the C3PAO assessment. <span className="text-bone-50 font-medium">Certified, or we don&rsquo;t stop.</span>
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-gold-300 px-6 py-4 text-sm font-medium tracking-wide text-ink-950 transition hover:bg-gold-200"
            >
              Book a Contract Risk Audit
              <span aria-hidden>&rarr;</span>
            </Link>
            <Link
              href="/cmmc-level-2"
              className="inline-flex items-center justify-center gap-2 border border-bone-300/30 px-6 py-4 text-sm font-medium tracking-wide text-bone-100 transition hover:border-gold-300 hover:text-gold-300"
            >
              See the 110 Controls
            </Link>
          </div>

          <div className="mt-14 grid max-w-3xl grid-cols-2 gap-y-6 gap-x-10 sm:grid-cols-4">
            <Stat k="90d" v="Gap to SPRS submission" />
            <Stat k="120d" v="Audit-ready posture" />
            <Stat k="110/110" v="Target SPRS score" />
            <Stat k="37" v="DoD primes engaged" />
          </div>
        </motion.div>
      </div>

      {/* Bottom hairline marquee */}
      <div className="relative border-t border-ink-700/70 bg-ink-900/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 overflow-x-auto px-6 py-4 lg:px-10">
          {["DFARS 252.204-7012", "DFARS 252.204-7019", "DFARS 252.204-7020", "DFARS 252.204-7021", "NIST SP 800-171 Rev. 2", "CMMC 2.0"].map(
            (t) => (
              <span key={t} className="whitespace-nowrap font-mono text-[10px] tracking-widest2 text-bone-300">
                {t}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-serif text-3xl text-bone-50">{k}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-bone-400">{v}</div>
    </div>
  );
}
