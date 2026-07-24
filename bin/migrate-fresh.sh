#!/usr/bin/env bash
set -e

LOCKFILE="bun.lock"
TARGET_DIR="${1:-.}"

if [ ! -f "$LOCKFILE" ]; then
  echo "Error: no bun.lock found in the current directory."
  echo "Run this from your project root, or 'cd' there first."
  exit 1
fi

if [ ! -f "${TARGET_DIR}/nuxt.config.ts" ] && [ ! -f "${TARGET_DIR}/nuxt.config.js" ]; then
  echo "Error: no nuxt.config.ts/.js found in '$TARGET_DIR'."
  echo "Pass the path to your Nuxt app: bunx nac-migrate-fresh path/to/app"
  exit 1
fi

# Step 1: back up the lockfile so we can undo the edit in step 2 later.
cp "$LOCKFILE" "${LOCKFILE}.bak"

# Step 2: remove the build-identifier suffix, so drizzle-orm and
# drizzle-kit resolve to the same, matching, identifier-free build — the
# one that CAN generate migrations.
sed -i -E 's/(drizzle-(orm|kit)@[0-9]+\.[0-9]+\.[0-9]+-rc\.[0-9]+)-[a-f0-9]+/\1/g' "$LOCKFILE"

bun i

# Step 3: actually generate migrations, under the hash-free pairing.
echo "==> Running 'nuxt db generate' in: $TARGET_DIR"
(rm -rf .data/ server/db/migrations/ && bunx nuxt db generate)

# Step 4: undo the lockfile edit, then deliberately discard it along with
# node_modules/.nuxt and reinstall from scratch. This is intentional: it
# lets bun re-resolve freely from your package.json ranges, landing back
# on whichever pairing actually runs your app correctly — that pairing
# can't be pinned exactly, since nothing fixes its build-identifier hash.
mv "${LOCKFILE}.bak" "$LOCKFILE"
rm -rf node_modules .nuxt
bun i

echo "Fresh migration completed."
echo "App-runnable dependencies restored. Verify with 'nuxt dev'."
