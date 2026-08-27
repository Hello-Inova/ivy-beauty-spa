#!/usr/bin/env bash
# Builds the static "modo demonstração" export (for GitHub Pages).
#
# Why this script exists: Next.js static export (`output: 'export'`) does
# not support Route Handlers that use cookies/Request, or Proxy
# (see https://nextjs.org/docs/app/guides/static-exports#unsupported-features).
# Our real API routes (src/app/api/**) and src/proxy.ts are only used in
# full/server mode, so this script temporarily moves them out of the way,
# swaps in next.config.demo.ts, builds, and restores everything afterwards
# (even if the build fails) so `git status` stays clean.
set -euo pipefail
cd "$(dirname "$0")/.."

export NEXT_PUBLIC_DEMO_MODE=true

# These are moved OUTSIDE the project tree (not just renamed in place) so
# TypeScript's `**/*.ts` include glob in tsconfig.json does not still pick
# them up and type-check them against a route-types file that (correctly)
# no longer knows about them once the API dir is out of src/app.
STASH_DIR="$(mktemp -d /tmp/ivy-demo-stash.XXXXXX)"

MOVED_API=false
MOVED_PROXY=false
SWAPPED_CONFIG=false

restore() {
  if [ "$SWAPPED_CONFIG" = true ] && [ -f next.config.ts.real ]; then
    mv -f next.config.ts.real next.config.ts
  fi
  if [ "$MOVED_API" = true ] && [ -d "$STASH_DIR/api" ]; then
    rm -rf src/app/api
    mv "$STASH_DIR/api" src/app/api
  fi
  if [ "$MOVED_PROXY" = true ] && [ -f "$STASH_DIR/proxy.ts" ]; then
    mv -f "$STASH_DIR/proxy.ts" src/proxy.ts
  fi
  rm -rf "$STASH_DIR"
}
trap restore EXIT

if [ -d src/app/api ]; then
  mv src/app/api "$STASH_DIR/api"
  MOVED_API=true
fi
if [ -f src/proxy.ts ]; then
  mv src/proxy.ts "$STASH_DIR/proxy.ts"
  MOVED_PROXY=true
fi
mv next.config.ts next.config.ts.real
cp next.config.demo.ts next.config.ts
SWAPPED_CONFIG=true

rm -rf out
next build

echo ""
echo "Build de demonstração pronto em ./out"
echo "Para pré-visualizar localmente: npx serve out"
