# CyberAutopsy — SEO Plan

Goal: rank page-1 for CMMC and DFARS intent keywords in 6–9 months, capture worried-contractor search demand, and convert into Contract Risk Audits. Target: 25 organic Audits booked per month by month 6.

---

## 1. Per-Page Targets — H1, Meta Title, Meta Description

| Path                | H1 (on page)                                                    | Meta Title (≤ 60 chars)                                    | Meta Description (≤ 158 chars)                                                                                            |
|---------------------|------------------------------------------------------------------|------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| `/`                 | CMMC Level 2 Certification. Guaranteed.                          | CMMC Level 2 Certification — Guaranteed \| CyberAutopsy   | RPO partnered with C3PAOs. Gap to SPRS submission in 90 days. Certified or we don't stop. Former DoD assessors on staff. |
| `/cmmc-level-2`     | CMMC Level 2. 110 controls. 14 families. One certificate.        | CMMC Level 2 Requirements — 110 Controls, SPRS, POA&M     | What CMMC Level 2 actually requires. NIST 800-171 mapping, SPRS scoring, POA&M rules, and the regulatory timeline.        |
| `/services`         | Four engagement tiers. One outcome: certified.                   | CMMC Services — Gap, Surge, Audit Escort, Retainer        | Fixed-scope engagements: Gap Assessment, Remediation Surge, Audit Escort, Annual Retainer. Built by former C3PAOs.       |
| `/process`          | The CyberAutopsy Method. Five phases. No surprises.              | CMMC Engagement Process — Diagnose, Expose, Operate       | Five phases, each producing an artifact a C3PAO will read. The CyberAutopsy Method explained, end to end.                |
| `/industries`       | Where CUI lives, we sit.                                         | CMMC for Primes, Subs, Manufacturers, SaaS, Universities  | Tailored CMMC engagements by industry. Prime contractors, subs, defense manufacturers, SaaS providers, and universities. |
| `/resources`        | The library. Plain English. No marketing.                        | CMMC Resources — Guides, SPRS Calculator, Self-Assessment | CMMC 2.0 guides, DFARS 7012 checklist, SPRS score estimator, and the Will-I-Fail self-assessment.                         |
| `/about`            | We were the assessor. Now we sit on your side of the table.     | About CyberAutopsy — Former DoD Assessors and CISOs      | Founded by lead C3PAO assessors and former CISOs. RPO partnered with three accredited C3PAOs. The founder story.         |
| `/contact`          | Book a Contract Risk Audit.                                      | Contact CyberAutopsy — Book a 15-Minute Triage Call       | Direct call with a partner. Bring your CAGE code and the contract you cannot afford to lose. 15 minutes, no pitch.       |

---

## 2. Schema Markup Plan

| Page         | Schema types                                                                                  |
|--------------|-----------------------------------------------------------------------------------------------|
| All pages    | `ProfessionalService` (in `app/layout.tsx`)                                                   |
| `/`          | `FAQPage` (in `app/page.tsx`)                                                                 |
| `/services`  | `Service` x 4 (one per tier) — to add                                                         |
| `/about`     | `Organization` + `Person` x 4 partners — to add                                               |
| `/resources` | `Article` per guide once MDX content lands; `BreadcrumbList` site-wide                        |

Both `professionalServiceSchema` and `faqSchema` already wired in `lib/schema.ts`.

---

## 3. Core Target Keywords (intent-graded)

| Keyword                                   | Volume tier | Intent       | Target page         |
|-------------------------------------------|-------------|--------------|---------------------|
| cmmc certification                        | High        | Awareness    | `/cmmc-level-2`     |
| cmmc level 2 requirements                 | High        | Comparison   | `/cmmc-level-2`     |
| cmmc consultant                           | Mid-High    | Commercial   | `/`                 |
| cmmc rpo                                  | Mid         | Commercial   | `/about`            |
| cmmc compliance services                  | Mid         | Commercial   | `/services`         |
| dfars 7012 compliance                     | Mid         | Awareness    | `/resources` + post |
| dfars 7019 compliance                     | Mid         | Awareness    | `/resources` + post |
| dfars 252.204-7012                        | Mid         | Reference    | `/resources` + post |
| sprs score                                | Mid-High    | Awareness    | `/cmmc-level-2`     |
| sprs score calculator                     | Mid         | Tool         | `/resources#sprs-calculator` |
| nist 800-171 gap assessment               | Mid         | Commercial   | `/services`         |
| nist 800-171 ssp template                 | Mid         | Tool         | Future MDX post     |
| poa&m cmmc                                | Low-Mid     | Awareness    | `/cmmc-level-2`     |
| c3pao assessment preparation              | Mid         | Commercial   | `/services`         |
| how to prepare for cmmc audit             | Mid         | Commercial   | `/process`          |

---

## 4. Twenty Blog Topics (publication-ready)

Each post is built as MDX in `app/resources/<slug>/page.mdx` (when CMS layer is added). Target length 1,500–2,200 words. All have a closing CTA to `/contact` and to the relevant tier on `/services`.

### Awareness tier (top of funnel)

1. **CMMC 2.0 vs CMMC 1.0: What Actually Changed**
   *Slug:* `cmmc-2-vs-1` · *Keywords:* cmmc 2.0, cmmc 1.0, cmmc differences
2. **The 14 NIST 800-171 Families, Plain-Language Decoded**
   *Slug:* `nist-800-171-families` · *Keywords:* nist 800-171, 14 families
3. **DFARS 252.204-7012: The 14 Obligations You Must Document**
   *Slug:* `dfars-7012-obligations` · *Keywords:* dfars 7012, dfars 252.204-7012
4. **DFARS 7019, 7020, 7021 Explained: A Field Guide**
   *Slug:* `dfars-7019-7020-7021` · *Keywords:* dfars 7019, dfars 7020, dfars 7021
5. **What Is a CMMC Assessment Boundary?**
   *Slug:* `cmmc-assessment-boundary` · *Keywords:* cmmc boundary, cui boundary
6. **CUI vs CDI vs FCI: Why the Terminology Decides Your Scope**
   *Slug:* `cui-cdi-fci-explained` · *Keywords:* cui vs cdi, controlled unclassified information

### Comparison / consideration tier

7. **RPO vs C3PAO: Why You Cannot Use the Same Firm for Both**
   *Slug:* `rpo-vs-c3pao` · *Keywords:* rpo c3pao difference
8. **GCC-High, Hardened Workstation, or Full Enclave: Choosing a CUI Architecture**
   *Slug:* `cui-enclave-architectures` · *Keywords:* gcc high cmmc, cui enclave
9. **Microsoft 365 GCC vs GCC-High for CMMC Level 2**
   *Slug:* `gcc-vs-gcc-high-cmmc` · *Keywords:* gcc high cmmc level 2
10. **Why Your Existing SSP Will Probably Fail a C3PAO Read**
    *Slug:* `ssp-failure-patterns` · *Keywords:* ssp template, system security plan

### Tool / data-driven posts

11. **SPRS Score Calculator: How the Weights Actually Work**
    *Slug:* `sprs-score-calculator` · *Keywords:* sprs score calculator, sprs scoring
12. **The 5 Controls That Fail 80% of Contractors (Anonymized)**
    *Slug:* `top-failing-controls` · *Keywords:* cmmc failed controls, sprs failed
13. **POA&M Mechanics Under CMMC 2.0: A Surgical Read**
    *Slug:* `poam-mechanics` · *Keywords:* poa&m cmmc, cmmc poa&m
14. **Reading a NIST 800-171A Determination Statement Without Tears**
    *Slug:* `nist-800-171a-determination` · *Keywords:* nist 800-171a, determination statement

### Sector / persona

15. **Subcontractor CMMC Survival Guide: When the Flow-Down Lands**
    *Slug:* `subcontractor-cmmc-survival` · *Keywords:* subcontractor cmmc, flow down cmmc
16. **CMMC for Defense Manufacturers: When the Shop Floor Holds CUI**
    *Slug:* `cmmc-for-manufacturers` · *Keywords:* manufacturer cmmc, itar cui
17. **CMMC for SaaS Providers and External Service Providers**
    *Slug:* `cmmc-saas-esp` · *Keywords:* cmmc esp, fedramp cmmc
18. **CMMC at Research Universities: Building a Defensible Enclave**
    *Slug:* `cmmc-universities-research` · *Keywords:* university cmmc, research cmmc

### Outcome / story

19. **What a C3PAO Actually Reads First: An Insider's Walkthrough**
    *Slug:* `c3pao-reads-first` · *Keywords:* c3pao assessment process
20. **How a $30M Manufacturer Lost a Contract Over an Unreadable SSP**
    *Slug:* `lost-contract-ssp-case-study` · *Keywords:* cmmc audit failure case study

---

## 5. Internal Linking Rules

- Every page links to `/contact` exactly once via primary CTA + once via CTA band.
- Every blog post links to (a) the relevant `/services` tier, (b) the `/cmmc-level-2` reference page, (c) a related blog post.
- `/resources` page anchors (`#sprs-calculator`, `#self-assessment`, `#dfars-checklist`) are referenced from the footer of every page so internal anchor density rises naturally.

---

## 6. Off-Page SEO Priorities (months 1–6)

1. **NDIA / AFCEA / SAE thought-leadership panels** — get the founder on three panels in the first six months. These produce backlinks from `ndia.org`, `afcea.org`, etc.
2. **Federal News Network / Defense One op-eds** — three op-eds at 1,200 words each. Backlinks from defense trade outlets carry strong topical relevance.
3. **CMMC Information Institute citations** — earn citations from the CMMC-AB knowledge base.
4. **Podcast circuit** — *CMMC News, Defense Mavericks, Federal Newscast*. Two appearances per quarter.
5. **HARO / Qwoted CMMC quotes** — pickup in defense and federal contracting trade press.

---

## 7. Technical SEO Checklist

- [x] SSR via Next.js App Router for all crawlable content (no client-only critical content).
- [x] OpenGraph + Twitter card metadata in root `layout.tsx`.
- [x] JSON-LD `ProfessionalService` (every page) + `FAQPage` (homepage).
- [x] Semantic HTML: `<main>`, `<nav>`, `<header>`, `<footer>`, ordered/unordered lists.
- [x] Skip-to-content link.
- [x] Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- [ ] `sitemap.ts` + `robots.ts` (add at launch).
- [ ] OG image at `/public/og.jpg` (1200×630, gold-foil treatment).
- [ ] Hero video poster at `/public/hero-poster.jpg` for video LCP fallback.
- [ ] Lighthouse target: 95+ on Performance, Accessibility, Best Practices, SEO. Validate with `next build && next start` before launch.
