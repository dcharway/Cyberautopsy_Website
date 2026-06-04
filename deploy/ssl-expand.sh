#!/usr/bin/env bash
# Expand (or re-issue) the Let's Encrypt cert so its SAN list covers all three
# CyberAutopsy hostnames in a single cert lineage:
#
#   - www.cyberautopsy.org    (canonical marketing)
#   - cyberautopsy.org        (apex, 301-redirects to www)
#   - portal.cyberautopsy.org (GRC portal)
#
# Idempotent: re-running just confirms the cert already covers everything.
#
# Run as root on the VPS:
#
#   sudo bash deploy/ssl-expand.sh
#
# Background: an earlier deploy bootstrapped certs separately for www +
# portal but the bare apex was never enrolled, so visitors hitting
# https://cyberautopsy.org/<path> were served the www cert and the browser
# flagged the name mismatch as "Not Secure". This script consolidates them.

set -euo pipefail

GREEN="\033[0;32m"; YELLOW="\033[0;33m"; RED="\033[0;31m"; NC="\033[0m"
log()  { echo -e "${GREEN}[ssl-expand]${NC} $*"; }
warn() { echo -e "${YELLOW}[ssl-expand]${NC} $*"; }
die()  { echo -e "${RED}[ssl-expand]${NC} $*" >&2; exit 1; }

if [[ $EUID -ne 0 ]]; then
  die "Run as root. Try: sudo $0"
fi

command -v certbot >/dev/null || die "certbot is not installed. Run deploy/bootstrap.sh first."
command -v nginx   >/dev/null || die "nginx is not installed. Run deploy/bootstrap.sh first."

# Letsencrypt registration email — falls back to a sensible default but can be
# overridden:  EMAIL=ops@example.com sudo bash deploy/ssl-expand.sh
EMAIL="${EMAIL:-d.twumgyamrah1@gmail.com}"

DOMAINS=(www.cyberautopsy.org cyberautopsy.org portal.cyberautopsy.org)

log "Requesting / expanding cert for: ${DOMAINS[*]}"
log "Registration email: $EMAIL"
echo

# --expand is the magic flag: if a cert already exists that covers a SUBSET
# of these names, certbot extends it to cover the union instead of issuing a
# brand-new lineage (which would orphan the old one).
certbot --nginx \
  -d www.cyberautopsy.org \
  -d cyberautopsy.org \
  -d portal.cyberautopsy.org \
  --expand \
  --redirect \
  --non-interactive \
  --agree-tos \
  -m "$EMAIL"

echo
log "Validating nginx config..."
nginx -t

log "Reloading nginx..."
systemctl reload nginx

echo
log "Verifying SAN coverage..."
SAN=$(echo | openssl s_client -connect cyberautopsy.org:443 -servername cyberautopsy.org 2>/dev/null \
        | openssl x509 -noout -ext subjectAltName 2>/dev/null || true)
echo "$SAN"

if echo "$SAN" | grep -q "DNS:cyberautopsy.org" \
   && echo "$SAN" | grep -q "DNS:www.cyberautopsy.org" \
   && echo "$SAN" | grep -q "DNS:portal.cyberautopsy.org"; then
  log "All three hostnames are in the SAN list. Done."
else
  warn "SAN check did not match all three hostnames. Inspect the output above."
  exit 2
fi
