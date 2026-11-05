#!/usr/bin/env bash
# Deploy ./dist to the web server (https://ardoid.eu/tdlconverter/)
#
# Configure the target via environment variable, e.g.
#   DEPLOY_TARGET="user@ardoid.eu:/var/www/ardoid.eu/tdlconverter/" npm run deploy
# Optional: DEPLOY_SSH="ssh -p 2222"   (custom ssh command / port)
#           DRY_RUN=1                  (only show what would change)
set -euo pipefail

ROOT="$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)"
cd "$ROOT"

: "${DEPLOY_TARGET:?Set DEPLOY_TARGET, e.g. user@ardoid.eu:/var/www/ardoid.eu/tdlconverter/}"
DEPLOY_SSH="${DEPLOY_SSH:-ssh}"

if [ ! -f dist/index.html ]; then
    echo "dist/ not found – running build first"
    bash scripts/build.sh
fi

RSYNC_OPTS=(-avz --delete --chmod=D755,F644 -e "$DEPLOY_SSH")
if [ "${DRY_RUN:-0}" = "1" ]; then
    RSYNC_OPTS+=(--dry-run)
fi

echo "▶ Deploying dist/ → $DEPLOY_TARGET"
rsync "${RSYNC_OPTS[@]}" dist/ "$DEPLOY_TARGET"
echo "✔ Deployed: https://ardoid.eu/tdlconverter/"
