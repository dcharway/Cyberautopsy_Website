#!/usr/bin/env bash
# Run on the VPS as `cyber` after `git pull` or an rsync push.
# Builds both apps and tells PM2 to reload.
#
# Usage:  ./deploy/redeploy.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Marketing site =================================================="
cd cyberautopsy-site
npm ci --omit=dev=false --silent
npm run build
cd ..

echo
echo "=== Portal =========================================================="
cd cyberautopsy-portal
npm ci --omit=dev=false --silent
npm run build
cd ..

echo
echo "=== PM2 reload ======================================================"
pm2 reload deploy/ecosystem.config.js --update-env
pm2 status

echo
echo "Done."
