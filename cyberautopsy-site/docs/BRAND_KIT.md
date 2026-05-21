# CyberAutopsy — Brand Kit

> Authority of a law firm. Precision of a Swiss watchmaker. Discipline of an aerospace program. We do not pitch — we diagnose.

---

## 1. Brand Voice

| Pillar              | What it sounds like                                                                 | What it never sounds like                            |
|---------------------|-------------------------------------------------------------------------------------|------------------------------------------------------|
| Clinical Precision  | "Three of fourteen families are likely failing. We know which three."               | "AI-powered compliance for the cloud era."           |
| Luxury Service      | "Assigned compliance surgeon. Weekly war rooms. C-suite briefings."                 | "Open a ticket in our portal."                       |
| Outcome Guarantee   | "Certified or we don't stop."                                                       | "Best-effort partnership."                           |
| Evidence-Driven     | "Every claim backed by an artifact a C3PAO will read."                              | "Trust the platform."                                |

**Three forbidden words/phrases:** *revolutionary, AI-powered, game-changing*. Three preferred ones: *artifact, defensible, dissect*.

---

## 2. Color System

| Token           | Hex      | Usage                                                  |
|-----------------|----------|--------------------------------------------------------|
| `ink.950`       | `#0A0A0B`| Page background (primary)                              |
| `ink.900`       | `#0F0F11`| Section background, cards                              |
| `ink.800`       | `#16161A`| Inset surfaces, code blocks                            |
| `ink.700`       | `#1F1F24`| Hairlines, borders                                     |
| `bone.50`       | `#FAFAFA`| Primary text                                           |
| `bone.200`      | `#E8E8E4`| Secondary text                                         |
| `bone.300`      | `#C9C9C2`| Tertiary text, captions                                |
| `bone.400`      | `#8E8E86`| Muted UI labels                                        |
| `gold.300`      | `#D4AF37`| **Primary accent** — CTAs, marks, eyebrows             |
| `gold.100`      | `#F2E6B5`| Hover/highlight gold                                   |
| `gold.500`      | `#8C6E1F`| Aged gold shadow tone                                  |
| `clinical.500`  | `#0EA5E9`| Optional secondary accent (data viz, blueprint grid)   |
| `signal.green`  | `#15803D`| Posture: Implemented                                   |
| `signal.amber`  | `#B45309`| Posture: Partial                                       |
| `signal.red`    | `#B91C1C`| Posture: Missing / High risk                           |

**Gold-foil gradient:** `linear-gradient(135deg, #D4AF37 0%, #F2E6B5 35%, #8C6E1F 70%, #D4AF37 100%)` — applied to the wordmark, hero headline accent, and the SPRS card.

**Contrast (WCAG AA):**
- `bone.50` on `ink.950`: 19.6:1 (AAA)
- `gold.300` on `ink.950`: 9.8:1 (AAA)
- `bone.400` on `ink.950`: 4.6:1 (AA for body)

---

## 3. Typography

| Role        | Family (pref / fallback)                   | Weight | Size scale                       |
|-------------|---------------------------------------------|--------|----------------------------------|
| Headline    | **Tiempos Headline** / Canela / Cormorant Garamond | 400 / 500 | 36 / 48 / 64 / 80 px |
| Body        | **Söhne** / Inter                          | 400 / 500 | 14 / 16 / 18 / 20 px              |
| UI labels   | **Söhne Mono** / JetBrains Mono            | 500     | 10 / 11 / 12 px, tracking 0.24em |

**Headline rule:** Always pair a serif headline (gravitas) with a mono eyebrow ("classified stamp" pattern). Body sans-serif sits between them. This three-voice stack is the Wall Street Journal / aerospace tech doc feel.

**Letter-spacing:**
- Headline: -0.04em (tracking tightest, the "luxury serif" tell)
- Body: 0
- Mono eyebrow: 0.24em uppercase

---

## 4. Logo Concept

**Mark idea:** A circular medallion (`<svg>` in `Navigation.tsx`). Three layers, all stroked in the gold-foil gradient:

1. **Outer ring** — registered-seal feel, evokes a federal medallion or aerospace certification stamp.
2. **Inner shield** — abstracted heater shield; signals "defense, protection."
3. **Diagonal stroke** — a scalpel passing edge-to-edge of the shield. This is the autopsy mark. The pivot dot at the lower-left tip is the scalpel handle.

**Why scalpel + shield (not skull):**
- A skull reads horror/hacker. We're rejecting that vocabulary.
- Scalpel reads surgeon, precision, deliberate intervention.
- Shield reads protection without screaming military.
- Together they say: *we cut into your environment to defend it.*

**Wordmark:** `CyberAutopsy` in Tiempos Headline 500, tracking tightest, optical kerning, no ligatures. Underneath, a hairline mono caption `SHIELD · COMPLIANCE` in gold.300 — borrowed from the reference medallion image you supplied.

**Lockup variants needed (export from Figma):**
- Primary: Mark + wordmark + caption, horizontal
- Stacked: Mark above wordmark
- Mark-only (for favicon, OG, social square)
- Gold-on-ink (primary), bone-on-ink (secondary), ink-on-bone (print)

**Don'ts:** No skulls, no bones, no scopes, no Matrix code rain, no hooded figures, no padlocks, no glowing world maps. Ever.

---

## 5. Imagery System

| Type                                  | Use                                              | Source / treatment                                  |
|---------------------------------------|--------------------------------------------------|------------------------------------------------------|
| Blueprint schematics (line art)       | Section dividers, hero background grid           | Tailwind `bg-blueprint bg-blueprint-grid` utility    |
| Redacted CUI document scans           | Resources page, gated brief                      | Scanned NIST PDFs with mock redaction bars           |
| X-ray of server rack / network gear   | About, Process page hero plates                  | Stock x-ray sourced from medical imaging vendors    |
| NIST doc texture                      | OG image, gated brief cover                      | Subtle paper grain over `ink.900`                    |
| Hero ambient video                    | Homepage hero only                               | `/public/cyberautopsy_video.mp4`, 40% opacity, gradient overlay |

**Never use:** Hackers in hoodies. Glowing world maps. Stock photos of "businesspeople" pointing at monitors. Padlock icons. Binary/Matrix backdrops.

---

## 6. Motion

- **Easing:** `easeOut` for entrances, `easeInOut` for state transitions. Never spring physics — too playful.
- **Duration:** 400–700ms for content reveals, 1000–1200ms for the SPRS dial fill (it should feel weighed, not snappy).
- **Triggers:** `whileInView` once: true, margin `-80px`. Don't re-animate on scroll-up.
- **Reduced motion:** Respect `prefers-reduced-motion`; all transitions collapse to instant.

---

## 7. Component System (built)

| Component        | File                                | Role                                     |
|------------------|-------------------------------------|------------------------------------------|
| `Hero`           | `components/Hero.tsx`               | Video hero with classified-stamp eyebrow, CTA pair, regulatory marquee |
| `ProcessTimeline`| `components/ProcessTimeline.tsx`    | Five-phase vertical timeline, scroll-reveal |
| `FamilyHeatmap`  | `components/FamilyHeatmap.tsx`      | 14-family interactive heatmap with hover-revealed failure pattern |
| `SPRSScoreCard`  | `components/SPRSScoreCard.tsx`      | Score dial showing -203 to +110 SPRS range |
| `Testimonial`    | `components/Testimonial.tsx`        | NDA-anonymized client quote with metric callout |
| `RiskCalculator` | `components/RiskCalculator.tsx`     | Live contract-value exposure calculator |
| `Navigation`     | `components/Navigation.tsx`         | Header with inline SVG mark              |
| `Footer`         | `components/Footer.tsx`             | Three-column footer with compliance badges |

---

## 8. Accessibility & Compliance

- WCAG **AA** target across all text and UI.
- 508 compliance posture (color is never the only signal — heatmap uses both color and proportional bars; SPRS uses both color and PASS/FAIL text).
- Skip-to-content link present.
- All interactive elements keyboard navigable; focus rings `2px gold.300, offset 2px`.
- `prefers-reduced-motion` honored.
- All SVG marks have `aria-hidden` when decorative; the logo `<Link>` has `aria-label`.

---

## 9. Tone Examples (use these as the swipe file)

- **Hero:** *"For DoD contractors who cannot afford to lose the next award."*
- **Section eyebrow:** *"THE DEADLINE"* / *"CASE FILE · 2025-Q1"* / *"110 CONTROLS · 14 FAMILIES"*
- **CTA primary:** *"Book a Contract Risk Audit →"*
- **CTA secondary:** *"See the 110 Controls"*
- **Microcopy under CTA:** *"Direct call with a partner. No pitch deck."*
- **Trust line:** *"CMMC-AB REGISTERED · CUI HANDLED"*
- **Outcome line:** *"Certified, or we don't stop."*

These are the lines that should appear, with minor variation, on every primary page.
