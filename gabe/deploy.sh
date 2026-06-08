#!/usr/bin/env bash
# Deploy the PropDev app to an environment on this droplet.
#   /root/propdev/gabe/deploy.sh staging   # build + restart staging  (branch: staging, :8081)
#   /root/propdev/gabe/deploy.sh prod       # build + restart prod     (branch: main,    :8080)
#
# Each environment has its own checkout, git branch, database/uploads dir,
# Node process (pm2) and port. nginx terminates TLS and proxies to the port.
set -euo pipefail

ENV="${1:-}"
case "$ENV" in
  prod)
    DIR=/root/propdev;          BRANCH=main;    PORT=8080
    DATA_DIR=/root/propdev-data;         NAME=gabe
    JWT_SECRET=propdev-9f3a7c21b840e5d6 ;;
  staging)
    DIR=/root/propdev-staging;  BRANCH=staging; PORT=8081
    DATA_DIR=/root/propdev-staging-data; NAME=gabe-staging
    JWT_SECRET=propdev-staging-7b21c93f1a ;;
  *)
    echo "usage: deploy.sh prod|staging"; exit 1 ;;
esac

export PORT DATA_DIR JWT_SECRET
mkdir -p "$DATA_DIR"

echo "▶ Deploying [$ENV]  branch=$BRANCH  port=$PORT  data=$DATA_DIR"
cd "$DIR"
git fetch --quiet origin
git checkout --quiet "$BRANCH"
git pull --ff-only origin "$BRANCH"

cd "$DIR/gabe"
echo "▶ Installing deps"
npm install --no-audit --no-fund --silent
( cd server && npm install --no-audit --no-fund --silent )

echo "▶ Building frontend"
CI=false GENERATE_SOURCEMAP=false NODE_OPTIONS=--max-old-space-size=1536 npm run build >/dev/null

echo "▶ (Re)starting $NAME"
cd "$DIR/gabe/server"
if pm2 describe "$NAME" >/dev/null 2>&1; then
  pm2 restart "$NAME" --update-env >/dev/null
else
  pm2 start index.js --name "$NAME" --update-env >/dev/null
fi
pm2 save >/dev/null

sleep 1
CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/" || echo "000")
echo "✓ [$ENV] deployed — local health: HTTP $CODE"
