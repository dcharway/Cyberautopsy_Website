"use client";

import { motion } from "framer-motion";

const phases = [
  {
    n: "01",
    code: "SCOPE",
    title: "Map the risk and the boundary",
    body:
      "We trace every system, person, data flow, and third party that touches the information you must protect. Anything in scope is documented; anything out of scope is excluded with evidence. The scoping decision sets the cost of everything that follows.",
    deliverable: "Scope Memo, Network Diagram, Data Flow Map",
    duration: "Week 1"
  },
  {
    n: "02",
    code: "ASSESS",
    title: "Score controls against real evidence",
    body:
      "Every control required by the applicable framework (NIST, CMMC, ISO 27001, SOC 2, HIPAA, and so on) is scored against artifacts you can actually produce. Implemented, partially implemented, or not implemented — with a per-control owner and severity weight.",
    deliverable: "SSP / Program Doc, POA&M / Findings Register, Baseline Score",
    duration: "Week 2"
  },
  {
    n: "03",
    code: "IMPLEMENT",
    title: "Remediate alongside your team",
    body:
      "A senior team works beside your engineers, compliance owners, and executives. Configurations applied, policies authored, training delivered, evidence captured. We do not hand you a backlog — we close it with you.",
    deliverable: "Implemented Controls, Evidence Library",
    duration: "Weeks 3–12"
  },
  {
    n: "04",
    code: "PROVE",
    title: "Audit / assessment support",
    body:
      "Your assessment packet is built the way the assessor reads it. We escort the engagement — reading rooms, evidence defense, real-time clarification. Findings get answered before they become findings.",
    deliverable: "Assessment Packet, Certification / Authorization Letter",
    duration: "Audit window"
  },
  {
    n: "05",
    code: "SUSTAIN",
    title: "Continuous monitoring + annual affirmation",
    body:
      "Configuration drift detection, control re-test, annual attestations and affirmations. Your posture stays current because someone is watching it weekly, not annually.",
    deliverable: "Quarterly Reviews, Annual Attestation",
    duration: "Ongoing"
  }
];

export function ProcessTimeline() {
  return (
    <section className="relative bg-ink-950 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="classified-stamp">FIVE-PHASE ENGAGEMENT MODEL</span>
          <h2 className="mt-6 font-serif text-4xl tracking-tightest sm:text-5xl">
            Five phases. <span className="gold-text">No surprises.</span>
          </h2>
          <p className="mt-5 text-bone-300">
            Framework-agnostic. Whether the target is CMMC, FedRAMP, ISO&nbsp;27001, SOC&nbsp;2,
            HIPAA, or a custom program, each phase produces an artifact that survives audit — not a
            slide that survives a meeting.
          </p>
        </div>

        <ol className="mt-16 relative border-l border-gold-300/30">
          {phases.map((p, i) => (
            <motion.li
              key={p.n}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="relative pl-10 pb-12 last:pb-0"
            >
              <span
                aria-hidden
                className="absolute -left-[7px] top-1 block h-3 w-3 rotate-45 border border-gold-300 bg-ink-950"
              />
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <span className="font-mono text-[11px] tracking-widest2 text-gold-300">{p.n} &middot; {p.code}</span>
                <span className="font-mono text-[11px] tracking-widest2 text-bone-400">{p.duration}</span>
              </div>
              <h3 className="mt-3 font-serif text-2xl text-bone-50 sm:text-3xl">{p.title}</h3>
              <p className="mt-3 max-w-2xl text-bone-300">{p.body}</p>
              <div className="mt-4 inline-flex items-center gap-2 border-l border-gold-300/40 pl-3 text-xs text-bone-300">
                <span className="font-mono uppercase tracking-widest text-bone-400">Deliverables</span>
                <span>{p.deliverable}</span>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
