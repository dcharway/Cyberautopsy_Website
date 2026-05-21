"use client";

import { motion } from "framer-motion";

type Props = {
  quote: string;
  attribution: string;
  org: string;
  metric?: { label: string; value: string };
};

export function Testimonial({
  quote,
  attribution,
  org,
  metric
}: Props) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="relative border border-ink-700 bg-ink-900 p-8 lg:p-12"
    >
      <div className="absolute -top-3 left-8 bg-ink-900 px-3 font-mono text-[10px] tracking-widest2 text-gold-300">
        CLIENT &middot; ANONYMIZED PER NDA
      </div>

      <blockquote className="font-serif text-2xl leading-snug tracking-tightest text-bone-50 lg:text-3xl">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <figcaption className="mt-8 flex flex-col gap-4 border-t border-ink-700 pt-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm text-bone-100">{attribution}</div>
          <div className="text-xs uppercase tracking-widest text-bone-400">{org}</div>
        </div>
        {metric && (
          <div className="border-l-0 lg:border-l border-gold-300/40 lg:pl-6">
            <div className="text-[10px] uppercase tracking-widest text-bone-400">{metric.label}</div>
            <div className="font-serif text-3xl text-gold-300">{metric.value}</div>
          </div>
        )}
      </figcaption>
    </motion.figure>
  );
}
