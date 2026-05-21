# Repository governance

Settings to apply on GitHub once the repo is live. Each section is a clickable path from the repo home, then the values to set.

---

## 1. Branch protection on `main`

**Why:** prevent direct pushes to `main`, force CI to pass, force review on any change that ships to production.

**Path:** `https://github.com/dcharway/Cyberautopsy_Website` → **Settings** → **Branches** → **Add branch ruleset** (or **Add classic branch protection rule**, both work).

Apply to: **`main`**

Enable:

- [x] **Require a pull request before merging**
  - Required approvals: `1` (or `2` once the team is > 2 people)
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from Code Owners (after you author `.github/CODEOWNERS`)
- [x] **Require status checks to pass before merging**
  - Require branches to be up to date before merging: **on**
  - Required checks: `cyberautopsy-site`, `cyberautopsy-portal` (both from the CI workflow)
- [x] **Require conversation resolution before merging**
- [x] **Require linear history** (no merge commits — clean log)
- [x] **Do not allow bypassing the above settings**
- [ ] Require signed commits — optional; turn on once everyone has GPG/SSH signing configured
- [ ] Restrict who can push to matching branches — set to `Repository administrators` if useful

Save.

---

## 2. CODEOWNERS

Create `.github/CODEOWNERS` once the team has multiple humans on it. Example:

```
# Auth flow — partner review required
/cyberautopsy-site/lib/auth/           @founder @ciso
/cyberautopsy-site/app/api/auth/       @founder @ciso
/cyberautopsy-portal/middleware.ts     @founder @ciso
/cyberautopsy-portal/lib/auth/         @founder @ciso

# Reports / exports — touch with care, C3PAOs read these
/cyberautopsy-portal/lib/reports/      @founder @lead-surgeon

# Deploy
/deploy/                               @founder
/DEPLOY.md                             @founder

# Brand / copy
/cyberautopsy-site/components/         @cmo @founder
/cyberautopsy-site/app/                @cmo @founder
/cyberautopsy-site/docs/               @cmo
```

Replace handles with real GitHub usernames before committing.

---

## 3. Secret scanning + Dependabot

**Path:** Settings → **Code security and analysis**.

- [x] **Dependency graph** — on (default for public repos; flip on for private)
- [x] **Dependabot alerts** — on
- [x] **Dependabot security updates** — on
- [x] **Secret scanning** — on (catches accidentally committed AWS keys, Stripe tokens, etc.)
- [x] **Secret scanning — push protection** — on (blocks the push if a secret would land)

If this repo is private (the default for a commercial product), some of these require GitHub Advanced Security. Hostinger does not provide that — buy it from GitHub directly or rely on push protection alone.

---

## 4. Required GitHub secrets

Once you wire production-bound automation (Resend, Sentry, future Stripe), add via:

**Path:** Settings → **Secrets and variables** → **Actions** → **New repository secret**.

Recommended secrets to keep here, **not** in `.env.local` files:

| Secret name           | Used by                              | Notes                                                |
|-----------------------|--------------------------------------|------------------------------------------------------|
| `RESEND_API_KEY`      | Future deploy steps that test mail  | Per-environment; rotate quarterly                    |
| `SENTRY_AUTH_TOKEN`   | Source-map upload (when Sentry adds) | Org token, scoped to project releases                |
| `VPS_SSH_KEY`         | A future deploy workflow             | Private key for the `cyber` user on the Hostinger VPS |
| `VPS_HOST`            | Same                                 | `cyberautopsy.org` or IP                             |

Do **not** put `SESSION_SECRET` here unless you also add a deploy job that writes it to the VPS — the VPS already has it in `.env.local`.

---

## 5. Recommended issue + PR templates

**Path:** Add `.github/ISSUE_TEMPLATE/bug.yml` and `.github/PULL_REQUEST_TEMPLATE.md`.

Keeps incoming bug reports structured (which engagement, which control, which environment) and PRs focused (linked engagement, screenshots if UI, deploy notes if production-affecting).

These can come in a follow-up commit once the workflow patterns are clear.

---

## 6. Topics + description (cosmetic)

**Path:** Repository home → ⚙️ next to **About**.

- Description: `CMMC Level 2 GRC platform — marketing site + portal. See cyberautopsy.org.`
- Website: `https://cyberautopsy.org`
- Topics: `cmmc` `nist-800-171` `grc` `compliance` `dod` `nextjs` `webauthn` `defense-industrial-base`

Makes the repo findable inside org search and signals scope to onboarding teammates.
