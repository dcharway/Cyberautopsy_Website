#!/usr/bin/env bash
# CyberAutopsy VPS bootstrap. Idempotent — safe to re-run.
#
# Run as root on a fresh Hostinger VPS (Ubuntu 22.04 or 24.04):
#   chmod +x bootstrap.sh
#   ./bootstrap.sh
#
# What it does:
#   - System update + unattended-upgrades
#   - Node 20 LTS via NodeSource
#   - PM2 (globally) + PM2 systemd hook
#   - Nginx + Certbot (snap)
#   - ufw firewall (22, 80, 443)
#   - fail2ban with the sshd jail
#   - Creates the `cyber` system user with a home dir
#
# Idempotent: re-running won't reinstall things that are already present.

set -euo pipefail

# Color helpers
GREEN="\033[0;32m"; YELLOW="\033[0;33m"; RED="\033[0;31m"; NC="\033[0m"
log()  { echo -e "${GREEN}[bootstrap]${NC} $*"; }
warn() { echo -e "${YELLOW}[bootstrap]${NC} $*"; }
die()  { echo -e "${RED}[bootstrap]${NC} $*" >&2; exit 1; }

if [[ $EUID -ne 0 ]]; then
  die "Run as root. Try: sudo $0"
fi

if ! grep -qE "^(VERSION_ID=\"(22|24)\\.)" /etc/os-release; then
  warn "This script targets Ubuntu 22.04 / 24.04. Detected:"
  grep -E "^(NAME|VERSION)" /etc/os-release
  warn "Continuing in 5 seconds — Ctrl-C to abort..."
  sleep 5
fi

log "1/9  Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq

log "2/9  Installing base tooling..."
apt-get install -y -qq \
  curl ca-certificates gnupg lsb-release \
  build-essential git rsync ufw fail2ban \
  unattended-upgrades apt-listchanges

# Unattended security upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

log "3/9  Installing Node.js 20 LTS..."
if ! command -v node >/dev/null || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
else
  log "    Node $(node -v) already installed."
fi
node -v
npm -v

log "4/9  Installing PM2..."
if ! command -v pm2 >/dev/null; then
  npm install -g pm2
fi
pm2 -v

log "5/9  Installing Nginx..."
if ! command -v nginx >/dev/null; then
  apt-get install -y -qq nginx
fi
systemctl enable --now nginx

log "6/9  Installing Certbot (via snap, per EFF recommendation)..."
if ! command -v snap >/dev/null; then
  apt-get install -y -qq snapd
fi
snap install core 2>/dev/null || snap refresh core
if ! command -v certbot >/dev/null; then
  snap install --classic certbot
  ln -sf /snap/bin/certbot /usr/bin/certbot
fi
certbot --version

log "7/9  Configuring firewall (ufw)..."
ufw --force reset >/dev/null
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment "SSH"
ufw allow 80/tcp comment "HTTP"
ufw allow 443/tcp comment "HTTPS"
ufw --force enable
ufw status verbose

log "8/9  Enabling fail2ban..."
systemctl enable --now fail2ban
# Ensure sshd jail is on
mkdir -p /etc/fail2ban/jail.d
cat > /etc/fail2ban/jail.d/sshd.conf <<'EOF'
[sshd]
enabled = true
port = ssh
maxretry = 4
bantime = 3600
findtime = 600
EOF
systemctl restart fail2ban

log "9/9  Creating 'cyber' user..."
if ! id -u cyber >/dev/null 2>&1; then
  useradd -m -s /bin/bash cyber
  # Allow the cyber user to use PM2's systemd unit installed by root
  log "    Created user 'cyber' (no password — use SSH keys)."
fi

# Authorize the same SSH keys for cyber that root has
if [[ -f /root/.ssh/authorized_keys ]]; then
  mkdir -p /home/cyber/.ssh
  cp /root/.ssh/authorized_keys /home/cyber/.ssh/authorized_keys
  chown -R cyber:cyber /home/cyber/.ssh
  chmod 700 /home/cyber/.ssh
  chmod 600 /home/cyber/.ssh/authorized_keys
  log "    Copied authorized_keys to cyber user."
fi

# Install PM2 startup hook for the cyber user
log "    Installing PM2 systemd hook for 'cyber'..."
env PATH="$PATH:/usr/bin" pm2 startup systemd -u cyber --hp /home/cyber >/dev/null
systemctl enable pm2-cyber >/dev/null 2>&1 || true

# Pre-create the project dir
mkdir -p /home/cyber/cyberautopsy
chown -R cyber:cyber /home/cyber/cyberautopsy

# Increase Node's default file watcher limit (Next.js dev server can hit this; harmless to set always)
if ! grep -q fs.inotify.max_user_watches /etc/sysctl.conf; then
  echo "fs.inotify.max_user_watches=524288" >> /etc/sysctl.conf
  sysctl -p >/dev/null
fi

echo
log "==============================================================="
log "  Bootstrap complete."
log "==============================================================="
echo
echo "Next steps:"
echo "  1. Switch to the cyber user:    su - cyber"
echo "  2. Push your code to:           /home/cyber/cyberautopsy/"
echo "  3. Follow DEPLOY.md from step 3 onward."
echo
echo "Public IP: $(curl -s -4 ifconfig.me || echo unknown)"
echo
