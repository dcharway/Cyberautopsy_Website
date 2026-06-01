# CyberAutopsy

> CMMC Accreditation. Guaranteed.

A high-trust, premium website for a luxury cybersecurity compliance firm serving DoD contractors who need CMMC Level 2 certification to stay eligible to bid.

---

## Stack

- **Next.js 14** (App Router, RSC, SSR)
- **Tailwind CSS 3.4** (custom design tokens)
- **Framer Motion 11** (entrance reveals only)
- **TypeScript 5.5**
- **lucide-react** for icons

No CMS yet — `/resources` pages are statically authored. Drop in MDX when you're ready (`@next/mdx`).

---

## Getting started

```bash
cd "cyberautopsy-site"
npm install
cp .env.example .env.local   # then fill in RESEND_API_KEY and INTAKE_EMAIL
npm run dev
```

Open http://localhost:3000.

The hero video is already in `public/cyberautopsy_video.mp4`. Add `public/hero-poster.jpg` (poster frame) and `public/og.jpg` (1200×630 OG image) before launch.

**Form backends:** `/api/contact` and `/api/lead-magnet` dispatch via [Resend](https://resend.com). Without `RESEND_API_KEY` set, submissions are accepted and logged as a no-op (useful in dev). Production must have both env vars set and the `INTAKE_FROM` sender domain verified in Resend.

---

## Project layout

```
cyberautopsy-site/
├── app/
│   ├── layout.tsx                # Root layout, metadata, JSON-LD
│   ├── page.tsx                  # Homepage
│   ├── globals.css               # Design tokens
│   ├── sitemap.ts                # Auto-generated sitemap
│   ├── robots.ts
│   ├── cmmc-level-2/page.tsx     # CMMC Level 2 deep dive
│   ├── services/page.tsx         # Four engagement tiers
│   ├── process/page.tsx          # The CyberAutopsy Method
│   ├── industries/page.tsx       # Primes, Subs, Mfrs, SaaS, Universities
│   ├── resources/
│   │   ├── page.tsx                          # Resources index
│   │   ├── cmmc-2-vs-1/page.tsx              # Blog: CMMC 2.0 vs 1.0
│   │   ├── dfars-7012-obligations/page.tsx   # Blog: The 14 DFARS 7012 obligations
│   │   ├── poam-mechanics/page.tsx           # Blog: POA&M mechanics
│   │   ├── sprs-estimator/page.tsx           # Tool: 10-question SPRS score estimator
│   │   └── will-i-fail/page.tsx              # Tool: 12-question family-risk self-assessment
│   ├── about/page.tsx            # Founder story, partners, careers, press
│   ├── contact/page.tsx          # Qualifier form + Calendly embed
│   ├── legal/
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── accessibility/page.tsx
│   └── api/
│       ├── contact/route.ts      # POST handler — qualifier intake → Resend
│       └── lead-magnet/route.ts  # POST handler — gated brief → Resend
├── components/
│   ├── Navigation.tsx            # Header with inline SVG mark
│   ├── Footer.tsx
│   ├── Hero.tsx                  # Video-backed hero
│   ├── ProcessTimeline.tsx       # 5-phase scroll-reveal timeline
│   ├── FamilyHeatmap.tsx         # Interactive 14-family heatmap
│   ├── SPRSScoreCard.tsx         # Animated SPRS score dial
│   ├── Testimonial.tsx           # NDA-stamped client quote
│   ├── RiskCalculator.tsx        # Live contract-exposure calculator
│   ├── ArticleShell.tsx          # Long-form post layout (eyebrow, ToC, related)
│   ├── LeadMagnetForm.tsx        # Gated brief form (client component)
│   ├── SPRSEstimator.tsx         # SPRS estimator engine (10 weighted questions)
│   └── WillIFail.tsx             # Family-risk self-assessment engine (12 questions)
├── lib/
│   ├── utils.ts                  # cn() + SITE constants
│   ├── schema.ts                 # JSON-LD ProfessionalService + FAQPage
│   └── intake.ts                 # Shared form validation + Resend dispatch
├── docs/
│   ├── BRAND_KIT.md              # Colors, typography, logo, voice
│   ├── SEO_PLAN.md               # H1s, metas, 20 blog topics
│   └── HOMEPAGE_WIREFRAME.md     # Section-by-section wireframe
└── public/
    └── cyberautopsy_video.mp4    # Hero ambient video
```

---

## Open items before launch

1. **Calendly URL** — replace `SITE.calendly` in `lib/utils.ts` with the founder's actual Calendly link.
2. **OG image** — produce a 1200×630 `public/og.jpg` (gold-foil + ink, see Brand Kit).
3. **Hero video poster** — `public/hero-poster.jpg`, single frame of the video at brand contrast.
4. **Phone + email** — confirm `SITE.phone` and `SITE.email` in `lib/utils.ts`.
5. **Brand fonts** — currently wired to free fallbacks (Cormorant Garamond + Inter + JetBrains Mono via `next/font`). When you license Tiempos Headline + Söhne, swap the imports in `app/layout.tsx` to `next/font/local`.
6. **CMS for /resources** — three posts are authored as TSX in `app/resources/*/page.tsx`. Migrate to `@next/mdx` when the remaining 17 from `docs/SEO_PLAN.md` are written.
7. **Form backend** — wired to Resend via `/api/contact` and `/api/lead-magnet`. Set `RESEND_API_KEY` + `INTAKE_EMAIL` (see `.env.example`).
8. **Image assets** — replace placeholder team avatars in `app/about/page.tsx` and `app/page.tsx` with real partner headshots.

---

## Performance budget

Target Lighthouse scores at launch:

| Metric              | Target |
|---------------------|--------|
| Performance         | ≥ 95   |
| Accessibility       | ≥ 95   |
| Best Practices      | ≥ 95   |
| SEO                 | 100    |

The hero video is the heaviest asset. Compress to ≤ 4 MB, set `preload="metadata"` (already done), and serve a poster frame for LCP. If the file is larger, transcode to AV1/WebM and serve via `<source>` order.

---

## Accessibility

- WCAG **AA** across all text.
- Color is never the sole signal (heatmap uses bars; SPRS uses pass/fail text).
- All interactive elements are keyboard reachable; `:focus-visible` ring is 2px gold.
- `prefers-reduced-motion` honored (`globals.css`).
- Skip-to-content link in `app/layout.tsx`.

---

## Commercial brief

This site exists to convert worried DoD contractors into 15-minute triage calls. Target: 25 booked Audits/month by month 6 → $500k ARR.

See `docs/SEO_PLAN.md` for the off-page playbook (NDIA panels, op-eds, podcast circuit).
