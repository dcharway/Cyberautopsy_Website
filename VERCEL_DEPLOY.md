# Deploying CyberAutopsy to Vercel

> Vercel is the native host for Next.js. Both apps deploy from the GitHub monorepo as two separate Vercel projects. DNS stays at Hostinger.
>
> End state: `https://cyberautopsy.org` (marketing) + `https://portal.cyberautopsy.org` (GRC), both on Vercel, both auto-deploying on every push to `main`.
>
> Time: ~15 minutes total, mostly waiting for DNS to propagate.

---

## Why two Vercel projects, not one

Both Next.js apps live in the same GitHub repo (`Cyberautopsy_Website`) under `cyberautopsy-site/` and `cyberautopsy-portal/`. Vercel doesn't render two apps from one project, so each app becomes its own Vercel project that points at the same repo with a different **Root Directory**.

Benefits: independent deploys, independent env vars, independent custom domains, independent rollback. Same code repo.

---

## 1. Generate the shared session secret (do this once, locally)

The marketing site signs handoff tokens; the portal verifies them. Both Vercel projects need the **same** `SESSION_SECRET` env var.

```bash
openssl rand -hex 32
# example output: 3b1e9a7d8c2f4b6e5d8a1c3e7f9d2b4a6c8e0d2f4a6c8e0d2f4a6c8e0d2f4a6c
```

Copy that value. You'll paste it twice — once into each Vercel project.

---

## 2. Create the marketing project

1. Go to <https://vercel.com/dcharways-projects>.
2. Click **Add New** → **Project**.
3. Under "Import Git Repository", find `dcharway/Cyberautopsy_Website` and click **Import**.
4. **Configure the project**:

   | Field | Value |
   |---|---|
   | Project Name | `cyberautopsy-site` |
   | Framework Preset | Next.js (auto-detected) |
   | **Root Directory** | Click **Edit** → set to `cyberautopsy-site` |
   | Build Command | *Leave default* (`next build`) |
   | Output Directory | *Leave default* |
   | Install Command | *Leave default* (`npm install`) |

5. **Expand "Environment Variables"** and add (use the **Plain Text** type for each):

   | Name | Value |
   |---|---|
   | `SESSION_SECRET` | (the value from step 1) |
   | `PORTAL_URL` | `https://portal.cyberautopsy.org` |
   | `RP_ID` | `cyberautopsy.org` |
   | `RP_ORIGIN` | `https://cyberautopsy.org` |

   These four are required. Optional (only if you want the contact form to actually email):

   | Name | Value |
   |---|---|
   | `RESEND_API_KEY` | (from resend.com after verifying `cyberautopsy.org` as a sender) |
   | `INTAKE_EMAIL` | `intake@cyberautopsy.com` |
   | `INTAKE_FROM` | `CyberAutopsy Intake <intake@cyberautopsy.com>` |

6. Click **Deploy**. Wait ~2 minutes. You'll see "🎉 Congratulations!" and a default URL like `cyberautopsy-site-abc123.vercel.app`.

   Open it. The marketing site is live. The `/portal` sign-in still expects `portal.cyberautopsy.org` for the redirect — that won't work until step 3.

---

## 3. Create the portal project

1. Back to <https://vercel.com/dcharways-projects>, **Add New** → **Project**.
2. Import the same `dcharway/Cyberautopsy_Website` repo.
3. **Configure**:

   | Field | Value |
   |---|---|
   | Project Name | `cyberautopsy-portal` |
   | Framework Preset | Next.js |
   | **Root Directory** | `cyberautopsy-portal` |
   | Build / Output / Install | *Leave default* |

4. **Environment Variables**:

   | Name | Value |
   |---|---|
   | `SESSION_SECRET` | (the **same** value from step 1 — must match exactly) |
   | `MARKETING_URL` | `https://cyberautopsy.org` |

5. Click **Deploy**. Wait ~2 minutes. Default URL like `cyberautopsy-portal-xyz789.vercel.app`.

   Hitting that URL directly should bounce you to `https://cyberautopsy.org/portal?returnTo=...` — that's the middleware doing its job, confirming the portal is gated and the cross-app handoff is wired.

---

## 4. Add the custom domains

### 4a. On the **marketing** project

1. Open the `cyberautopsy-site` project → **Settings** → **Domains**.
2. Add domain: `cyberautopsy.org` → **Add**.
3. Vercel offers two configurations:
   - **Use A record** → `76.76.21.21`
   - **Use ANAME / CNAME** → `cname.vercel-dns.com`

   For Hostinger DNS, the **A record** is simpler. Note the IP Vercel shows you (it may differ from `76.76.21.21` depending on region).

4. Add domain: `www.cyberautopsy.org` → **Add**. Vercel will offer to redirect `www` → apex. Accept.

### 4b. On the **portal** project

1. Open `cyberautopsy-portal` → **Settings** → **Domains**.
2. Add domain: `portal.cyberautopsy.org` → **Add**.
3. Vercel will show a CNAME target like `cname.vercel-dns.com`.

---

## 5. Set DNS at Hostinger

Open <https://hpanel.hostinger.com/domain/cyberautopsy.org/dns-zone>.

Add these records (edit existing entries if they collide):

| Type  | Name     | Points to                    | TTL  |
|-------|----------|------------------------------|------|
| A     | `@`      | (Vercel's A IP from step 4a) | 3600 |
| CNAME | `www`    | `cname.vercel-dns.com`       | 3600 |
| CNAME | `portal` | `cname.vercel-dns.com`       | 3600 |

If the A record for `@` currently points at a Hostinger parking page, **edit** it. Don't duplicate.

Wait 5–60 minutes for DNS to propagate. Verify:

```bash
dig +short cyberautopsy.org
dig +short www.cyberautopsy.org
dig +short portal.cyberautopsy.org
```

Each should resolve to a Vercel IP or CNAME.

Back in each Vercel project's **Domains** page, the green checkmark replaces the "Invalid Configuration" warning once DNS lands. Vercel auto-issues SSL certificates from Let's Encrypt within a minute of that.

---

## 6. Verify the live flow

From any browser:

1. <https://cyberautopsy.org> — marketing site loads with the hero video.
2. <https://cyberautopsy.org/portal> — sign-in renders with demo credentials.
3. Sign in with `demo@cyberautopsy.com` / `cyberautopsy-demo` + TOTP code.
4. After "Verified", you're redirected to `https://portal.cyberautopsy.org/dashboard`.
5. The portal renders — top-right shows `demo@cyberautopsy.com · TOTP`.
6. Sign out → bounces to `https://cyberautopsy.org/portal` for re-auth.

If any of these don't work, see Troubleshooting below.

---

## 7. Future deploys (automatic)

Both Vercel projects now watch `dcharway/Cyberautopsy_Website` on GitHub. Any push to `main` triggers a parallel deploy of both projects. Pull requests get **preview deploys** with unique URLs — open a PR, get a `cyberautopsy-site-pr-3.vercel.app` to test on before merge.

Rolling back: Vercel project page → **Deployments** → pick a previous successful deploy → **Promote to Production**. One click.

---

## Important: about persistence on Vercel

The auth store (`cyberautopsy-site/lib/auth/store.ts`) writes to a JSON file. On Vercel, the only writable directory is `/tmp/`, which is **ephemeral** — it does not survive cold starts or deploys.

What this means in practice:

- **The demo user is fine.** It's re-seeded every cold start because the password hash and TOTP secret are constants embedded in code.
- **WebAuthn registrations will be lost** on cold starts or new deploys. Your security key works for the session you registered it in; after the next cold start, you'll need to re-register.

For real production with real users, swap the file store for one of:

1. **Vercel Postgres** (managed, integrates in 2 clicks via Vercel Storage tab — has free tier)
2. **Vercel KV** (Redis-style, perfect for sessions)
3. **External Postgres** (Supabase, Neon, Railway, your own)

The `lib/auth/store.ts` module has a small surface (six functions). Swapping the file backend for any of the above is a 30-minute job. I'd recommend **Vercel Postgres + Drizzle** for the cleanest path.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `404 NOT_FOUND` on cyberautopsy.org | DNS hasn't propagated yet, or Vercel hasn't verified the domain | Wait 10 minutes; refresh the Vercel Domains page. |
| Portal redirects in a loop | `SESSION_SECRET` mismatch between the two Vercel projects | Settings → Env vars → Edit `SESSION_SECRET` to the exact same value on both. Then trigger a redeploy. |
| WebAuthn fails: "The relying party ID is not a registrable domain suffix of..." | `RP_ID` env var still set to `localhost` | Settings → Env vars on `cyberautopsy-site` → set `RP_ID=cyberautopsy.org`. Redeploy. |
| `Invalid configuration` red badge on a domain | DNS record points somewhere else | `dig +short <subdomain>.cyberautopsy.org` — if it's not Vercel's IP/CNAME, fix the record at Hostinger. |
| Contact form returns 200 but no email arrives | `RESEND_API_KEY` not set (intentional fallback to log-only) | Optional — only matters if you want emails. Add the key in `cyberautopsy-site` env vars. |
| Build fails: "Cannot find module 'exceljs'" | Vercel's serverless function bundling stripping it | Root Directory must be `cyberautopsy-portal`. `serverComponentsExternalPackages: ["exceljs"]` is already set in `next.config.js`. |

---

## Cost on Vercel free tier

| Resource | Free limit | This project's usage |
|---|---|---|
| Bandwidth | 100 GB/mo | Plenty for a marketing site + private portal |
| Build minutes | 6000/mo | Each deploy ~3 min; well under |
| Serverless function invocations | 100k/mo | Far under |
| Custom domains | Unlimited on Hobby | Two needed |

Real-world cost for this project on Vercel Hobby (free): **$0/mo**. The Hobby tier prohibits commercial use, though — for actual client-billed work you'd move to **Pro** ($20/mo per member).
