# CyberAutopsy

> CMMC Level 2 certification, guaranteed.

A two-app monorepo serving CyberAutopsy:

- **`cyberautopsy-site/`** — marketing site at <https://cyberautopsy.org> (Next.js 14 App Router, SSR, MFA sign-in)
- **`cyberautopsy-portal/`** — GRC workspace at <https://portal.cyberautopsy.org> (Next.js 14, 110-control registry, POA&M kanban, CAP workflow, real XLSX/ZIP exports)
- **`deploy/`** — Hostinger VPS deployment scripts and Nginx/PM2 config
- **`DEPLOY.md`** — step-by-step production deploy guide

## Quick start (local dev)

```bash
# Marketing site (port 3000)
cd cyberautopsy-site
cp .env.example .env.local   # fill in SESSION_SECRET
npm install
npm run dev

# In another terminal: GRC portal (port 3100)
cd cyberautopsy-portal
cp .env.example .env.local   # same SESSION_SECRET as the marketing site
npm install
npm run dev
```

Open <http://localhost:3000>. Sign in at `/portal` with the demo credentials shown on the page.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, server components, edge middleware) |
| Styling | Tailwind CSS 3.4 with custom ink + bone + gold tokens |
| Type system | TypeScript 5.5 strict mode |
| Auth | scrypt password hashing · RFC 6238 TOTP · WebAuthn via `@simplewebauthn` · HMAC-signed session tokens |
| Exports | ExcelJS for XLSX, JSZip for ZIP |
| Process management (prod) | PM2 |
| Reverse proxy (prod) | Nginx + Certbot (Let's Encrypt) |
| Hosting (prod) | Hostinger VPS |

## Production deploy

Two supported paths:

- **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** — Vercel (native Next.js host) for the apps + Hostinger for DNS only. Live in ~15 min, auto-deploys on every push.
- **[DEPLOY.md](./DEPLOY.md)** — Hostinger VPS, full Node.js stack. PM2 + Nginx + Certbot. ~45 min initial setup, full control of the server.

## Documentation

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — local setup, commit conventions, what CI checks
- [`docs/REPO_GOVERNANCE.md`](./docs/REPO_GOVERNANCE.md) — branch protection, CODEOWNERS, GitHub secrets
- [`cyberautopsy-site/docs/BRAND_KIT.md`](./cyberautopsy-site/docs/BRAND_KIT.md) — colors, typography, voice
- [`cyberautopsy-site/docs/SEO_PLAN.md`](./cyberautopsy-site/docs/SEO_PLAN.md) — H1s, meta titles, 20-post content plan
- [`cyberautopsy-site/docs/HOMEPAGE_WIREFRAME.md`](./cyberautopsy-site/docs/HOMEPAGE_WIREFRAME.md) — section-by-section homepage spec
- [`cyberautopsy-portal/README.md`](./cyberautopsy-portal/README.md) — portal architecture and modules

## License

Proprietary. See [LICENSE](./LICENSE).

## CI

[![CI](https://github.com/dcharway/Cyberautopsy_Website/actions/workflows/ci.yml/badge.svg)](https://github.com/dcharway/Cyberautopsy_Website/actions/workflows/ci.yml)

`next build` runs against both apps on every push to `main` and every pull request. See [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).
