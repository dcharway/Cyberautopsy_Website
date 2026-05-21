#!/usr/bin/env bash
# Rsync both projects to the VPS.
# Usage:  bash deploy/push.sh <vps-ip-or-host> [<vps-user>]
# Default user is `cyber`. SSH key must already be authorized.

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <vps-ip-or-host> [<vps-user>]"
  exit 1
fi

VPS="$1"
USER_NAME="${2:-cyber}"
REMOTE_DIR="/home/${USER_NAME}/cyberautopsy"

# Locate this script's directory and the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Pushing from   : $ROOT_DIR"
echo "Pushing to     : ${USER_NAME}@${VPS}:${REMOTE_DIR}"
echo

# Make sure the remote dir exists
ssh "${USER_NAME}@${VPS}" "mkdir -p ${REMOTE_DIR}"

# rsync — exclude things we never want on the VPS
rsync -avz --delete \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.data/' \
  --exclude='.env.local' \
  --exclude='.git/' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  "$ROOT_DIR/cyberautopsy-site/"   "${USER_NAME}@${VPS}:${REMOTE_DIR}/cyberautopsy-site/"

rsync -avz --delete \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.env.local' \
  --exclude='.git/' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  "$ROOT_DIR/cyberautopsy-portal/" "${USER_NAME}@${VPS}:${REMOTE_DIR}/cyberautopsy-portal/"

rsync -avz \
  --exclude='*.log' \
  "$ROOT_DIR/deploy/"              "${USER_NAME}@${VPS}:${REMOTE_DIR}/deploy/"

rsync -avz \
  "$ROOT_DIR/DEPLOY.md"            "${USER_NAME}@${VPS}:${REMOTE_DIR}/DEPLOY.md"

echo
echo "Pushed. Next on the VPS as ${USER_NAME}:"
echo "  cd ~/cyberautopsy"
echo "  cd cyberautopsy-site  && npm ci && npm run build && cd .."
echo "  cd cyberautopsy-portal && npm ci && npm run build && cd .."
echo "  pm2 reload all   # or  pm2 start deploy/ecosystem.config.js && pm2 save"
