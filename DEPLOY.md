# Deploying CyberAutopsy to a Hostinger VPS

> Target: `https://cyberautopsy.org` (marketing) + `https://portal.cyberautopsy.org` (GRC)
> Stack on the VPS: Ubuntu 22.04 · Node 20 LTS · PM2 · Nginx · Certbot (Let's Encrypt)

---

## What you'll do, in order

1. **DNS** — point `cyberautopsy.org` and `portal.cyberautopsy.org` at the VPS IP (in your Hostinger hPanel).
2. **VPS bootstrap** — SSH in, run one script that installs Node, PM2, Nginx, Certbot, and the firewall rules.
3. **Push code** — copy the two projects to the VPS (git or rsync).
4. **Configure** — set production env vars on the VPS (HMAC secret, WebAuthn RP, portal URL).
5. **Build & launch** — `npm ci` + `next build` on the VPS, then PM2 starts both apps.
6. **Nginx** — drop the two site configs in, reload Nginx.
7. **SSL** — `certbot --nginx` on both hostnames.
8. **Verify** — sign in over HTTPS, confirm the cross-origin handoff still works.

Total time: **30–60 minutes**, mostly waiting for `npm install` and DNS to propagate.

---

## 0. Prerequisites

- A Hostinger VPS plan with **Ubuntu 22.04** (or 24.04) and SSH access.
- The VPS public IP (visible in hPanel → VPS → Overview).
- Your Hostinger DNS panel for `cyberautopsy.org`.
- Local: a terminal with `ssh`, `scp` or `rsync`, and (optionally) `git`.

---

## 1. Set DNS (Hostinger hPanel)

Open <https://hpanel.hostinger.com/domain/cyberautopsy.org/dns-zone>.

Add (or update) **two A records** pointing at your VPS IP:

| Type | Name     | Points to       | TTL  |
|------|----------|-----------------|------|
| A    | `@`      | `<your-vps-ip>` | 3600 |
| A    | `portal` | `<your-vps-ip>` | 3600 |

If `@` already exists (likely points at a Hostinger parking page), **edit** it — don't add a duplicate. Same for `www` if it exists: change it to a CNAME pointing at `cyberautopsy.org`.

Verify propagation:

```bash
dig +short cyberautopsy.org
dig +short portal.cyberautopsy.org
# both should return your VPS IP
```

Propagation can take 5 minutes to a few hours. Move on to step 2 while you wait — the bootstrap doesn't need DNS.

---

## 2. Bootstrap the VPS

SSH in as root:

```bash
ssh root@<your-vps-ip>
```

Upload `deploy/bootstrap.sh` to the VPS (one way — from your local machine):

```bash
scp "c:/Users/User/Desktop/Cybersecurity autopsy/deploy/bootstrap.sh" root@<your-vps-ip>:/root/
```

On the VPS:

```bash
chmod +x /root/bootstrap.sh
/root/bootstrap.sh
```

The script:

- Installs Node 20 LTS, PM2, Nginx, Certbot, ufw, fail2ban, and build tooling.
- Creates a non-root user `cyber` for running the apps.
- Opens ports 22, 80, 443 in ufw; closes everything else.
- Installs PM2's systemd hook so apps survive reboots.

When it finishes, switch to the `cyber` user:

```bash
su - cyber
```

You're now ready to push code.

---

## 3. Push the code to the VPS

You have two options. Pick one.

### Option A — git (recommended for ongoing deploys)

On your local machine, initialize a repo and push to GitHub:

```bash
cd "c:/Users/User/Desktop/Cybersecurity autopsy"
git init
git add cyberautopsy-site cyberautopsy-portal deploy DEPLOY.md
git commit -m "Initial CyberAutopsy commit"
# create a private repo on github.com first, then:
git remote add origin git@github.com:<your-handle>/cyberautopsy.git
git push -u origin main
```

On the VPS (as `cyber`):

```bash
cd ~
git clone git@github.com:<your-handle>/cyberautopsy.git cyberautopsy
# (or https://github.com/... if you don't have an SSH deploy key set up)
```

### Option B — rsync from local

On your local machine, run the helper:

```bash
# from c:/Users/User/Desktop/Cybersecurity autopsy
bash deploy/push.sh <your-vps-ip>
```

This rsyncs both projects to `/home/cyber/cyberautopsy/` on the VPS, excluding `node_modules/`, `.next/`, and `.data/`.

---

## 4. Configure production environment

On the VPS (`cyber@vps`), create the two `.env.local` files from the templates:

```bash
cd ~/cyberautopsy

# Generate a strong shared secret (run once, copy the value)
SESSION_SECRET=$(openssl rand -hex 32)
echo "SESSION_SECRET=$SESSION_SECRET"

cp deploy/.env.production.site.example   cyberautopsy-site/.env.local
cp deploy/.env.production.portal.example cyberautopsy-portal/.env.local

# Edit both files — replace REPLACE_ME with your SESSION_SECRET, and any Resend/etc keys
nano cyberautopsy-site/.env.local
nano cyberautopsy-portal/.env.local
```

The same `SESSION_SECRET` value must appear in **both** files. The portal verifies tokens issued by the marketing site using this secret.

---

## 5. Build and launch

Still as `cyber`, in `~/cyberautopsy`:

```bash
# Marketing site
cd cyberautopsy-site
npm ci
npm run build
cd ..

# Portal
cd cyberautopsy-portal
npm ci
npm run build
cd ..

# Start both under PM2
pm2 start deploy/ecosystem.config.js
pm2 save
```

`pm2 status` should show both apps **online** on ports 3000 and 3100. Logs: `pm2 logs cyberautopsy-site` and `pm2 logs cyberautopsy-portal`.

---

## 6. Nginx reverse proxy

Switch back to root (`exit` to leave `cyber`, then you're root again). Drop the two Nginx site configs into place:

```bash
# Replace cyber's home if you customized it
sudo cp /home/cyber/cyberautopsy/deploy/nginx-cyberautopsy.org.conf       /etc/nginx/sites-available/cyberautopsy.org
sudo cp /home/cyber/cyberautopsy/deploy/nginx-portal.cyberautopsy.org.conf /etc/nginx/sites-available/portal.cyberautopsy.org

# Enable both
sudo ln -sf /etc/nginx/sites-available/cyberautopsy.org        /etc/nginx/sites-enabled/cyberautopsy.org
sudo ln -sf /etc/nginx/sites-available/portal.cyberautopsy.org /etc/nginx/sites-enabled/portal.cyberautopsy.org

# Remove the default site if you haven't already
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

At this point, **http://cyberautopsy.org** should load the marketing site (HTTP only, no SSL yet).

---

## 7. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d cyberautopsy.org -d www.cyberautopsy.org -d portal.cyberautopsy.org \
  --redirect --agree-tos --email you@cyberautopsy.org --no-eff-email
```

Certbot edits the Nginx configs in place — adds the SSL certificate paths and an HTTP→HTTPS redirect block. Renewals run automatically via the `certbot.timer` systemd unit (`systemctl status certbot.timer`).

Test renewal:

```bash
sudo certbot renew --dry-run
```

---

## 8. Verify the live site

From your laptop:

```bash
curl -I https://cyberautopsy.org
curl -I https://portal.cyberautopsy.org   # should 307-redirect to the marketing /portal sign-in
```

Open <https://cyberautopsy.org/portal>:

1. Sign in with `demo@cyberautopsy.com` / `cyberautopsy-demo` + the TOTP code.
2. After redirect to `https://portal.cyberautopsy.org/dashboard`, the dashboard renders.
3. Sign out — cookie clears, next portal hit redirects back to the marketing sign-in.

If WebAuthn was failing in dev because of `localhost`, it works now: `RP_ID=cyberautopsy.org` and `RP_ORIGIN=https://cyberautopsy.org` are real, and the browser will run the FIDO2 ceremony for real.

---

## Future updates

Once the initial deploy is done, updates are:

```bash
# On the VPS, as cyber
cd ~/cyberautopsy
git pull                                  # or rsync from local again
cd cyberautopsy-site  && npm ci && npm run build && cd ..
cd cyberautopsy-portal && npm ci && npm run build && cd ..
pm2 reload all
```

There's a `deploy/redeploy.sh` helper that does exactly this.

---

## Troubleshooting

| Symptom                                           | Likely cause                                                  | Fix                                                                                            |
|---------------------------------------------------|---------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `502 Bad Gateway` on the apex domain              | Marketing app crashed or didn't start                         | `pm2 status` and `pm2 logs cyberautopsy-site`                                                  |
| Portal redirects in a loop                        | `SESSION_SECRET` mismatch between the two `.env.local` files  | Re-run `openssl rand -hex 32`, put the **same** value in both                                  |
| WebAuthn registration fails on `cyberautopsy.org` | `RP_ID` or `RP_ORIGIN` still set to `localhost`               | Edit `cyberautopsy-site/.env.local`, set `RP_ID=cyberautopsy.org`, `RP_ORIGIN=https://cyberautopsy.org`, then `pm2 reload cyberautopsy-site` |
| TOTP code is rejected                             | VPS clock is off                                              | `timedatectl status` should show NTP synchronized                                              |
| `EACCES: permission denied, mkdir '.data'`        | The `cyber` user can't write the working dir                  | `chown -R cyber:cyber /home/cyber/cyberautopsy`                                                |
| Certbot fails with `Connection refused`           | Nginx isn't actually listening on :80 yet                     | `sudo nginx -t && sudo systemctl restart nginx` first                                          |
| Apps load on HTTP but not HTTPS                   | Certbot's redirect block was skipped                          | `sudo certbot --nginx -d cyberautopsy.org` and answer Y when asked to redirect                  |

---

## Production hardening checklist (after first-deploy works)

- [ ] Replace the seeded demo user (`demo@cyberautopsy.com`) — either delete it or change the password
- [ ] Move `.data/auth-store.json` to a real database (Postgres on the same VPS is the smallest leap)
- [ ] Add fail2ban rules for `/api/auth/login` brute force
- [ ] Add Nginx rate limits for `/api/auth/*` (10 req/min/IP recommended)
- [ ] Set up automatic backups of `.data/` (and the DB once added)
- [ ] Add monitoring (uptimerobot.com on both hostnames is the cheap start)
- [ ] Configure Resend or Postmark for the `/api/contact` form (set `RESEND_API_KEY` + `INTAKE_EMAIL` in env)
- [ ] Confirm the `Strict-Transport-Security` header is being served (Nginx config sets it; verify with `curl -I`)
