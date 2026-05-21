# Homepage Wireframe — Section by Section, Mobile-First

The homepage is **eight sections**. Each section is one decision: the user either keeps scrolling (commits) or leaves. The first three sections must answer *Am I in the right place* and *Should I be scared*; the last three must answer *Who runs this firm* and *How do I start.*

Layout: stacked single column on mobile (≤ 1024px). Two-column at `lg:` breakpoint. Max content width is `1280px` (max-w-7xl) with `24px` (mobile) / `40px` (desktop) gutter.

---

## §1 — Hero (component: `Hero`)

```
┌────────────────────────────────────────────────┐
│   [ AMBIENT VIDEO at 40% opacity ]             │
│   [ Blueprint grid overlay at 30% ]            │
│                                                │
│   RPO · PARTNERED WITH C3PAOs (mono eyebrow)   │
│                                                │
│   CMMC Level 2 Certification.                  │
│   Guaranteed.            (Tiempos 80px)        │
│                                                │
│   For DoD contractors who cannot afford…       │
│   (body 20px, 2 lines on desktop)              │
│                                                │
│   [ Book a Contract Risk Audit → ]  [ See 110 ]│
│   (gold filled CTA, ghost CTA)                 │
│                                                │
│   90d   |  120d   |  110/110  |  37            │
│   Gap…  |  Audit… |  SPRS…    |  Primes…       │
│                                                │
│ ── REGULATORY MARQUEE ──                       │
│  DFARS 7012 · 7019 · 7020 · 7021 · NIST · CMMC │
└────────────────────────────────────────────────┘
```

**Mobile collapse:**
- Headline scales to 48px, both CTAs full-width stacked.
- Stat row collapses to 2x2.
- Marquee scrolls horizontally with overflow-x-auto.

**Why this hero, not a different one:** the brief calls for loss aversion. Hero says "Guaranteed" (positive promise) over a video that subliminally reads as defense / control room. The first stat ("90d to SPRS submission") is the operational answer to the unspoken fear.

---

## §2 — The Deadline

```
┌────────────────────────────────────────────────┐
│  THE DEADLINE                                  │
│                                                │
│  The clause is already in your next contract.  │
│  ───────────────────────────────────────────   │
│  Body copy on left (max-w-prose2 ≈ 68ch)       │
│                                                │
│                              [ 7012 ]  [ 7019 ]│
│                              [ 7020 ]  [ 7021 ]│
│                              (2x2 pillar grid) │
└────────────────────────────────────────────────┘
```

**Mobile:** copy stacks above pillar grid; pillar grid becomes 2x2 spanning full width.

---

## §3 — The 110 Controls (component: `FamilyHeatmap`)

```
┌────────────────────────────────────────────────┐
│  110 CONTROLS · 14 FAMILIES                    │
│  You have 14 families to defend.               │
│  Three are usually failing.                    │
│                                                │
│                              [ LEGEND PANEL ]  │
│                              · Implemented · Partial · Missing │
│                                                │
│  ┌───┬───┬───┬───┬───┬───┬───┐                 │
│  │AC │AT │AU │CM │IA │IR │MA │ (heatmap)       │
│  ├───┼───┼───┼───┼───┼───┼───┤                 │
│  │MP │PS │PE │RA │CA │SC │SI │                 │
│  └───┴───┴───┴───┴───┴───┴───┘                 │
│                                                │
│  ┌────────────────────────────────────────┐    │
│  │ Hovered family detail (a11y live region)│    │
│  └────────────────────────────────────────┘    │
└────────────────────────────────────────────────┘
```

**Mobile:** heatmap becomes 2-up, then 4-up at sm, then 7-up at lg. Hover detail surfaces below on tap.

---

## §4 — Case File / SPRS Card / Testimonial

```
┌────────────────────────────────────────────────┐
│  CASE FILE · 2025-Q1                           │
│  A $200M defense manufacturer.                 │
│  $48M contract saved.                          │
│                                                │
│  Body                                          │
│  [ 89d ] [ 47 ] [ 0 ]                          │
│                                                │
│  ┌──────────────────────────────┐              │
│  │ Testimonial w/ NDA stamp     │              │
│  │ "They sat on our side …"     │              │
│  │ CISO · $200M Defense Mfr     │              │
│  └──────────────────────────────┘              │
│                                                │
│                          ┌─────────────────┐   │
│                          │ SPRS SCORE CARD │   │
│                          │     [ 110 ]     │   │
│                          │   dial · 88     │   │
│                          └─────────────────┘   │
└────────────────────────────────────────────────┘
```

**Mobile:** SPRS card stacks below testimonial. Both render at 100% width.

---

## §5 — Surgical Process (component: `ProcessTimeline`)

Vertical timeline with five rotated-square markers on a left rule. Each phase reveals on scroll (Framer Motion `whileInView`). Mobile: identical, just full-width.

---

## §6 — Why C3PAOs Trust Our Clients

Three-pillar grid (A / B / C). On mobile, stacks. Each pillar is `border border-ink-700` on `bg-ink-950`, mono eyebrow, serif title, body copy.

---

## §7 — Team

Two-column `1fr / 1.4fr` on desktop. Left: heading + founder link. Right: 2x2 grid of team cards. Mobile: stacks; team grid becomes 1-up.

---

## §8 — Risk Calculator (component: `RiskCalculator`)

Two-column form / result split. Mobile: form first, result below. The result panel is the only place on the page where we use the gold-foil border + `shadow-gilt` — it must feel like the "appraised valuation" reveal.

---

## §9 — Final CTA Band

Centered, narrow column (max-w-5xl). Eyebrow + headline + body + single gold CTA. This is the second-to-last interaction surface on the page; the footer that follows is the last.

---

## Section ordering rationale

| Position | Job                                       | Section          |
|----------|-------------------------------------------|------------------|
| 1        | Promise + identity                        | Hero             |
| 2        | Fear: the regulatory truth                | The Deadline     |
| 3        | Fear: the operational truth (110 controls)| FamilyHeatmap    |
| 4        | Proof: it has been done                   | Case + SPRS      |
| 5        | How: the method                           | ProcessTimeline  |
| 6        | Why us, not someone else                  | Why C3PAOs trust |
| 7        | Who we are (humans, not a platform)       | Team             |
| 8        | Quantify the loss (loss aversion)         | RiskCalculator   |
| 9        | One commitment ask                        | CTA band         |

The arc is: **fear → proof → method → people → quantify → ask.** This is the same structure used by McKinsey, Sidley, and FTI capability decks — and it converts.
