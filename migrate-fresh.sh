#!/usr/bin/env bash

# migrate-fresh.sh
#
# WHAT PROBLEM THIS SOLVES:
# nuxt-auto-crud depends on two related npm packages, 'drizzle-orm' and
# 'drizzle-kit'. Right now both are pre-release ("release candidate")
# builds, published as something like "1.0.0-rc.4-ca0f029" — that last
# part ("ca0f029") is a build identifier, and it can differ between the
# two packages even when both say "1.0.0-rc.4".
#
# The migration tool ('drizzle-kit') expects a very specific, matching
# build of 'drizzle-orm'. If your installed versions don't match exactly,
# generating migrations fails with an error like:
#   "SQLiteSyncDialect is not a constructor"
#
# But the specific paired build that actually RUNS the app correctly
# (not just migrations) can't be pinned exactly either — it's whatever
# your dependency ranges happen to resolve to. So this script doesn't try
# to preserve one exact state; it deliberately swaps between two states:
#
#   1. Temporarily strip the build-identifier suffix from both packages,
#      so they resolve to a matching, non-conflicting pair — this pairing
#      can generate migrations, but has a separate runtime bug
#      ("event.req.text is not a function") that makes it unsuitable for
#      actually running the app.
#   2. Generate the migration(s) using that pairing.
#   3. Undo the lockfile edit, then wipe node_modules/.nuxt/the lockfile
#      entirely and reinstall from scratch. This intentionally lets your
#      dependency ranges re-resolve fresh, landing back on the pairing
#      that runs the app correctly (in practice: drizzle-kit@...-ca0f029 /
#      drizzle-orm@...-de6c356) — the same pairing you'd get from a clean
#      install today.
#
# You do NOT need to understand any of the above to use this script — just
# run it whenever you've changed a database schema and need new migration
# files.
#
# HOW TO RUN:
#   ./migrate-fresh.sh              Migrations for "playground" (the default)
#   ./migrate-fresh.sh authz        Migrations for test/fixtures/authz
#   ./migrate-fresh.sh basic        Migrations for test/fixtures/basic
#   ./migrate-fresh.sh relations    Migrations for test/fixtures/relations
#   ./migrate-fresh.sh all          Every valid target, one after another
#   ./migrate-fresh.sh --list       Shows every valid target, without running anything
#
# Targets are found automatically: any folder that has its own
# "nuxt.config.ts" — either "playground/" or a subfolder of
# "test/fixtures/" — counts as a valid target. You don't need to edit this
# script when a new fixture is added later.
#
# AFTER THIS SCRIPT FINISHES:
# The app-runnable dependency pairing is restored, but it's worth
# confirming everything still works before you move on:
#   - For "playground": run `nuxt dev` inside playground/ and check the app.
#   - For a test fixture: run `bun run test` from the repo root.
#
# FIRST-TIME SETUP:
# If you see "Permission denied" when running this, your system just
# hasn't marked the file as runnable yet. Fix it once with:
#   chmod +x migrate-fresh.sh

set -e

LOCKFILE="bun.lock"
TARGET_ALIAS="${1:-playground}"

declare -A TARGET_DIRS

if [ -f "playground/nuxt.config.ts" ]; then
  TARGET_DIRS["playground"]="playground"
fi

if [ -d "test/fixtures" ]; then
  for dir in test/fixtures/*/; do
    name="$(basename "$dir")"
    if [ -f "${dir}nuxt.config.ts" ]; then
      TARGET_DIRS["$name"]="${dir%/}"
    fi
  done
fi

list_targets() {
  echo "Available targets:"
  for name in "${!TARGET_DIRS[@]}"; do
    echo "  - $name  (${TARGET_DIRS[$name]})"
  done
}

if [ "$TARGET_ALIAS" = "--list" ]; then
  list_targets
  exit 0
fi

run_generate() {
  local target="$1"
  local target_dir="${TARGET_DIRS[$target]:-}"

  if [ -z "$target_dir" ]; then
    echo "Error: Unknown target '$target'."
    list_targets
    exit 1
  fi

  echo "==> Running 'nuxt db generate' in: $target_dir"
  (cd "$target_dir" && rm -rf .data node_modules .nuxt && bunx nuxt db generate)
}

# Step 1: back up the lockfile so we can undo the edit in step 2 later.
cp "$LOCKFILE" "${LOCKFILE}.bak"

# Step 2: remove the build-identifier suffix, so both packages resolve to
# the same, matching, identifier-free build — the one that CAN generate
# migrations.
sed -i -E 's/(drizzle-(orm|kit)@[0-9]+\.[0-9]+\.[0-9]+-rc\.[0-9]+)-[a-f0-9]+/\1/g' "$LOCKFILE"

bun i

echo "==> Preparing module stubs and types..."
bun run dev:prepare

# Step 3: actually generate the migration(s), under the hash-free pairing.
if [ "$TARGET_ALIAS" = "all" ]; then
  for name in "${!TARGET_DIRS[@]}"; do
    run_generate "$name"
  done
else
  run_generate "$TARGET_ALIAS"
fi

# Step 4: undo the lockfile edit from step 2 (restore the pre-script
# lockfile contents)...
mv "${LOCKFILE}.bak" "$LOCKFILE"

# ...then deliberately discard it along with node_modules/.nuxt, and
# reinstall from scratch. This is intentional, not a cleanup oversight:
# letting bun re-resolve freely from package.json's ranges is how you
# land back on the pairing that actually runs the app correctly, which
# can't be pinned exactly since nothing fixes its build-identifier hash.
rm -rf node_modules .nuxt
bun i
bun run dev:prepare

echo "Fresh migration completed for '$TARGET_ALIAS'."
echo "App-runnable dependencies restored. Verify with 'nuxt dev' (playground) or 'bun run test' (fixtures)."