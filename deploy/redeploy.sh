#!/usr/bin/env bash
# Run on the VPS as `cyber`. Pulls latest from origin/main, builds both apps,
# tells PM2 to reload.
#
# Usage:  bash deploy/redeploy.sh
#
# To skip the git pull (e.g. when you've rsync'd manually), set NO_PULL=1:
#   NO_PULL=1 bash deploy/redeploy.sh

set -euo pipefail
cd "$(dirname "$0")/.."

if [[ "${NO_PULL:-0}" != "1" ]]; then
  echo "=== Pulling latest from origin/main ================================="
  git pull --ff-only
  echo
fi

echo "=== Marketing site =================================================="
cd cyberautopsy-site
npm ci --no-audit --no-fund --silent
npm run build
cd ..

echo
echo "=== Portal =========================================================="
cd cyberautopsy-portal
npm ci --no-audit --no-fund --silent
npm run build
cd ..

echo
echo "=== PM2 reload ======================================================"
pm2 reload deploy/ecosystem.config.js --update-env
pm2 status

echo
echo "Done."
