# CyberAutopsy GRC Portal

> A CMMC Level 2 governance, risk, and compliance workspace.

The product surface for CyberAutopsy. Where the marketing site at `cyberautopsy-site/` converts prospects, this portal serves them once engaged — 110-control registry, evidence repository, POA&M workflow, CAP-aligned assessment workflow, annual affirmation, and reports.

---

## Stack

- **Next.js 14** App Router (RSC + dynamic routes)
- **Tailwind CSS 3.4** with shared brand tokens (ink + bone + gold) plus CMMC status palette
- **next/font** for Inter / Cormorant Garamond / JetBrains Mono
- **lucide-react** for icons
- **TypeScript 5.5**, strict mode
- No charting library — all dashboards are hand-rolled SVG (lighter, more on-brand)

Runs on **port 3100** so it doesn't collide with the marketing site (port 3000).

---

## Running

```bash
cd "cyberautopsy-portal"
npm install
npm run dev
```

Open <http://localhost:3100>. The root path redirects to `/dashboard`.

---

## Project layout

```
cyberautopsy-portal/
├── app/
│   ├── layout.tsx                # TopBar + LeftNav shell, fonts
│   ├── page.tsx                  # → redirect to /dashboard
│   ├── globals.css
│   ├── dashboard/page.tsx        # Executive overview
│   ├── controls/page.tsx         # 110-control table with drawer
│   ├── evidence/page.tsx         # Evidence repository
│   ├── poam/page.tsx             # POA&M Kanban
│   ├── assessments/page.tsx      # 4-phase CAP workflow
│   ├── affirmations/page.tsx     # Annual senior-official affirmation
│   ├── reports/page.tsx          # Export catalog
│   └── admin/page.tsx            # Org, users, integrations, security
├── components/
│   ├── shell/
│   │   ├── TopBar.tsx            # Org context + search + user
│   │   ├── LeftNav.tsx           # 8-module sidebar
│   │   └── Mark.tsx              # SVG seal mark
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── FamilyHeatmap.tsx     # 14-family heatmap, drillable
│   │   ├── StatusDonut.tsx       # SVG donut
│   │   ├── BurndownChart.tsx     # 90-day remediation burndown (SVG)
│   │   └── AssessorRequests.tsx  # C3PAO request queue
│   ├── controls/
│   │   ├── ControlTable.tsx      # Filterable 110-row table
│   │   └── ControlDrawer.tsx     # Right drawer with 5 tabs
│   ├── poam/
│   │   └── POAMKanban.tsx        # 4-column Kanban with movement
│   ├── assessments/
│   │   └── CAPStepper.tsx        # 4-phase stepper + checklist
│   └── ui/
│       └── StatusBadge.tsx       # Shared status pill + color tokens
├── data/
│   ├── controls110.ts            # All 110 controls (NIST 800-171 Rev. 2)
│   └── poam.ts                   # Sample POA&M items
└── lib/
    ├── utils.ts                  # cn() + ORG constants
    ├── types.ts                  # Domain types
    └── analytics.ts              # SPRS score, family posture, severity
```

---

## What's built

| Module          | State    | Notes                                                                                  |
|-----------------|----------|----------------------------------------------------------------------------------------|
| Dashboard       | **Live** | 5 KPI cards · 14-family heatmap (drillable) · status donut · burndown · C3PAO requests |
| Controls        | **Live** | All 110 controls · filter by family/status · search · drawer with 5 tabs               |
| Evidence        | **Live** | Coverage by family · expiring/expired tracker · sample master list                     |
| POA&M           | **Live** | 4-column Kanban with movement · risk + due-date warnings                               |
| Assessments     | **Live** | 4-phase CAP stepper · per-phase checklist · blocker panel                              |
| Affirmations    | **Live** | Days-to-due hero · history table                                                       |
| Reports         | **Live** | 6 export types · catalog UI · primary "C3PAO Assessment Packet" zip                    |
| Admin           | **Live** | Org · users/roles · integrations · security · notifications                            |

---

## Domain model (in `lib/types.ts`)

- `Control` — the 110 NIST 800-171 controls with SPRS weight (1/3/5), status, owner, evidence pointers, POA&M link
- `Evidence` — artifact with control mapping, expiration, file-naming-aware
- `POAM` — risk, milestones, owner, status (4 states), 180-day clock awareness
- `AssessmentEvent` — phase, blockers, artifact tracking
- `ControlStatus` — Implemented / Partial / Not Implemented / Not Applicable / Not Started / Under Review

---

## Brand alignment

Same ink + bone + gold palette as the marketing site, augmented with the spec's CMMC status palette:

| Token              | Hex       | Use                       |
|--------------------|-----------|---------------------------|
| `status.met`       | `#16A34A` | Implemented               |
| `status.partial`   | `#F59E0B` | Partial / At Risk         |
| `status.failed`    | `#DC2626` | Not Implemented           |
| `status.review`    | `#2563EB` | Under Review              |
| `status.notStarted`| `#6B7280` | Not Started               |
| `status.na`        | `#71717A` | Not Applicable            |

Status colors are always paired with text or shape signals (badges, bars) so color is never the sole indicator — keeps the dense data-viz WCAG-AA-friendly.

---

## Open items before client rollout

1. **Persistence** — current state lives in memory only. Wire to Postgres + Drizzle (or Convex) for real workspaces.
2. **Auth** — add SSO via Microsoft Entra ID (per Admin panel) using `next-auth` or Clerk.
3. **File storage** — evidence uploads need S3 (or Azure Blob in GCC-High) with versioning and FIPS-validated TLS.
4. **Role-based access control** — Partner / Contributor / Executive viewer / Assessor (read-only) are stubbed in Admin but not enforced.
5. **Real exports** — Reports page lists 6 export types; implement actual XLSX / PDF / ZIP generation.
6. **Audit log** — record every status change, evidence upload, POA&M move into an immutable log (required for assessor review).
7. **Integrations** — wire the AD / CrowdStrike / Splunk / Tenable / SPRS / DIBNet integrations shown in Admin.
8. **Drag-and-drop on the POA&M Kanban** — current movement is ←/→ button-based for simplicity; add `dnd-kit` for native drag.

The MVP UI is intentionally complete enough to demo to a contractor in a sales call and to a C3PAO in a readiness review.
