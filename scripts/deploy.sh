#!/usr/bin/env bash
# Apply pending D1 migrations, optionally seed platforms, build, and deploy.
# Uses npx wrangler in CI and wrangler_personal locally.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -n "${CI:-}" ]; then
  run_wrangler() {
    npx wrangler "$@"
  }
else
  run_wrangler() {
    ./scripts/wrangler-personal.sh "$@"
  }
fi

if [ "${SKIP_MIGRATIONS:-false}" != "true" ]; then
  echo "Applying pending D1 migrations (remote)..."
  run_wrangler d1 migrations apply DATABASE --remote

  if [ "${SKIP_SEED:-false}" != "true" ]; then
    echo "Seeding OTT platforms (remote)..."
    run_wrangler d1 execute DATABASE --remote --file=scripts/seed-platforms.sql
  fi
else
  echo "Skipping D1 migrations and seed (SKIP_MIGRATIONS=true)."
fi

echo "Building OpenNext..."
# NEXT_PUBLIC_* vars are inlined at build time; wrangler.jsonc vars alone do not update client bundles.
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://watch-buddy.geass.workers.dev}"
echo "Using NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL for client build"
npx opennextjs-cloudflare build

echo "Deploying to Cloudflare..."
run_wrangler deploy
