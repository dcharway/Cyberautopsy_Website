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
          <div className="flex flex-wrap items-center gap-3">
            <span className="classified-stamp">CYBERSECURITY · RISK · TECHNOLOGY</span>
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest2 text-bone-400">
              FEDERAL &middot; DEFENSE &middot; REGULATED &middot; COMMERCIAL
            </span>
          </div>

          <h1 className="mt-10 font-serif text-5xl leading-[1.02] tracking-tightest sm:text-6xl lg:text-7xl">
            Cybersecurity, GRC, and technology services.
            <br />
            <span className="gold-text">Risk-based, not checklist-driven.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-200 sm:text-xl">
            We help federal agencies, defense contractors, regulated organizations, and commercial
            businesses strengthen cybersecurity, satisfy compliance obligations, and modernize
            technology environments.{" "}
            <span className="text-bone-50 font-medium">
              CMMC, NIST, FedRAMP, FISMA, Zero Trust, ISO&nbsp;27001, SOC&nbsp;2, HIPAA — supported
              as part of a broader portfolio.
            </span>
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-gold-300 px-6 py-4 text-sm font-medium tracking-wide text-ink-950 transition hover:bg-gold-200"
            >
              Request Consultation
              <span aria-hidden>&rarr;</span>
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 border border-bone-300/30 px-6 py-4 text-sm font-medium tracking-wide text-bone-100 transition hover:border-gold-300 hover:text-gold-300"
            >
              Explore all services
            </Link>
          </div>

          <div className="mt-14 grid max-w-3xl grid-cols-2 gap-y-6 gap-x-10 sm:grid-cols-4">
            <Stat k="6" v="Service practices" />
            <Stat k="10+" v="Frameworks supported" />
            <Stat k="Federal" v="&amp; commercial clients" />
            <Stat k="Risk-first" v="Engagement model" />
          </div>
        </motion.div>
      </div>

      {/* Bottom hairline marquee — frameworks + capabilities we support */}
      <div className="relative border-t border-ink-700/70 bg-ink-900/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 overflow-x-auto px-6 py-4 lg:px-10">
          {[
            "NIST SP 800-53",
            "NIST SP 800-171",
            "CMMC",
            "FedRAMP",
            "FISMA",
            "Zero Trust",
            "ISO 27001",
            "SOC 2",
            "HIPAA",
            "DFARS 7012"
          ].map((t) => (
            <span key={t} className="whitespace-nowrap font-mono text-[10px] tracking-widest2 text-bone-300">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-serif text-3xl text-bone-50">{k}</div>
      <div
        className="mt-1 text-xs uppercase tracking-widest text-bone-400"
        dangerouslySetInnerHTML={{ __html: v }}
      />
    </div>
  );
}
