# Contributing to CyberAutopsy

This repository is proprietary (see [LICENSE](./LICENSE)). External pull requests are not accepted. The notes below are for internal contributors and engagement partners with write access.

---

## Local setup

```bash
git clone https://github.com/dcharway/Cyberautopsy_Website.git cyberautopsy
cd cyberautopsy

# Marketing site
cd cyberautopsy-site
cp .env.example .env.local        # fill in SESSION_SECRET (any 32+ chars in dev)
npm install
npm run dev                       # → http://localhost:3000
```

In a second terminal:

```bash
cd cyberautopsy-portal
cp .env.example .env.local        # MUST use the same SESSION_SECRET as the marketing site
npm install
npm run dev                       # → http://localhost:3100
```

The two apps share a session secret. If they diverge, the cross-origin handoff fails (portal endlessly redirects to the marketing sign-in).

---

## Branch + commit conventions

- Default branch: **`main`**.
- Feature work: short-lived branches off `main`, named `feat/<scope>`, `fix/<scope>`, `chore/<scope>`. Squash-merge on close.
- Commit subject line: present tense, ≤ 72 chars, lowercase imperative. Example: `feat(portal): wire real evidence upload to S3`.
- Body: one paragraph minimum on **why**, not just **what**. Link to the engagement, ticket, or assessment finding it's tied to.

---

## What CI checks

Every push and PR runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

- `npm ci` for both apps in parallel
- `next build` for both — this also runs the TypeScript typecheck

A PR cannot be merged with a failing build (assuming branch protection is on; see [docs/REPO_GOVERNANCE.md](./docs/REPO_GOVERNANCE.md)).

---

## Before you commit

- [ ] `npm run build` passes in the app(s) you touched
- [ ] No `console.log` debug output left in source
- [ ] No `.env.local`, `.data/`, or any secret-bearing file added (the [`.gitignore`](./.gitignore) covers these — verify with `git status`)
- [ ] You changed copy in user-facing strings? Check the [brand voice rules](./cyberautopsy-site/docs/BRAND_KIT.md#1-brand-voice) — no `revolutionary`, `AI-powered`, or `game-changing`.

---

## Adding a new control to the portal

The 110-control registry lives in [`cyberautopsy-portal/data/controls110.ts`](./cyberautopsy-portal/data/controls110.ts). It is **not** a 110-row CSV — it's a typed seed with realistic state. If NIST or DoD revises 800-171, edit the seed and rebuild.

A module-load assertion enforces `length === 110`. Don't break that invariant.

---

## Auth changes

The auth flow spans both apps. Anything touching:

- [`cyberautopsy-site/lib/auth/`](./cyberautopsy-site/lib/auth/) (TOTP, WebAuthn, store, session)
- [`cyberautopsy-site/app/api/auth/`](./cyberautopsy-site/app/api/auth/) (route handlers)
- [`cyberautopsy-portal/lib/auth/session.ts`](./cyberautopsy-portal/lib/auth/session.ts) (verifier — mirror)
- [`cyberautopsy-portal/middleware.ts`](./cyberautopsy-portal/middleware.ts) (the gate)

…must be reviewed by a partner before merge. Don't ship auth changes solo.

---

## Production deploy

Production lives on a Hostinger VPS. See [DEPLOY.md](./DEPLOY.md) for the full playbook. Day-to-day updates after the initial deploy are:

```bash
# on the VPS as `cyber`
cd ~/cyberautopsy && git pull && ./deploy/redeploy.sh
```
