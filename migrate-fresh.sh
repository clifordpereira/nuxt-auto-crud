#!/usr/bin/env bash

# Purpose: Resolves version mismatch between drizzle-orm and drizzle-kit release candidates (RC).
# Lockfiles can pin conflicting build hashes (e.g., @1.0.0-rc.4-ca0f029 vs -de6c356), breaking 
# migration generation. This script strips those specific commit hashes to force resolution alignment, 
# executes 'nuxt db generate' in the targeted app/fixture, and cleans up the working tree back to 
# its exact original lockfile state.
#
# How to run:
#   ./migrate-fresh.sh           (Defaults to playground)
#   ./migrate-fresh.sh authz     (Runs on test/fixtures/authz)
#   ./migrate-fresh.sh basic     (Runs on test/fixtures/basic)
#   ./migrate-fresh.sh all       (Runs on all targets sequentially)
#
# If this script fails with "Permission denied", make it executable first:
#   chmod +x migrate-fresh.sh

set -e

TARGET_ALIAS="${1:-playground}"
LOCKFILE="bun.lock"

run_generate() {
  local target="$1"
  local target_dir=""

  case "$target" in
    playground)
      target_dir="playground"
      ;;
    authz)
      target_dir="test/fixtures/authz"
      ;;
    basic)
      target_dir="test/fixtures/basic"
      ;;
    *)
      echo "Error: Unknown target '$target'. Valid options: playground, authz, basic, all"
      exit 1
      ;;
  esac

  echo "==> Preparing target types: $target_dir"
  (cd "$target_dir" && bunx nuxt prepare)

  echo "==> Running 'nuxt db generate' in: $target_dir"
  (cd "$target_dir" && bunx nuxt db generate)
}

cp "$LOCKFILE" "${LOCKFILE}.bak"

sed -i -E 's/(drizzle-(orm|kit)@[0-9]+\.[0-9]+\.[0-9]+-rc\.[0-9]+)-[a-f0-9]+/\1/g' "$LOCKFILE"

bun i

echo "==> Preparing core module stubs..."
bun run dev:prepare

if [ "$TARGET_ALIAS" = "all" ]; then
  run_generate "playground"
  run_generate "authz"
  run_generate "basic"
else
  run_generate "$TARGET_ALIAS"
fi

mv "${LOCKFILE}.bak" "$LOCKFILE"

rm -rf node_modules .nuxt "$LOCKFILE"

bun i

echo "==> Restoring dev stubs and tsconfig state..."
bun run dev:prepare

echo "Fresh migration completed for '$TARGET_ALIAS' and environment restored."