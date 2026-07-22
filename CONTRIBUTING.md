# Contributing to nuxt-auto-crud (NAC)

Contributions are welcomed.

### How you can contribute

1. **Issue Reporting:** Create issues for bugs, security vulnerabilities, or missing features.
2. **Issue Resolution:** Submit fixes for existing open issues.
3. **Manual Testing:** Validate features within the playground environment.

---

### Technical Contribution Guidelines

* **Standards:** Follow official Nuxt conventions and documentation.
* **Workflow:** Fork the repository and verify changes in your local environment.
* **Quality:** Provide adequate automated tests for all logic changes.
* **Submission:** If your work benefits the core module, please submit a PR for review.

## 🧰 Local Development: Migration Generation

`nuxt db generate` wraps `drizzle-kit`. As of writing, `drizzle-kit@1.0.0-rc.4` and `drizzle-orm@1.0.0-rc.4` are pre-1.0 **release-candidate snapshot builds** (published as `1.0.0-rc.4-<commit-hash>`, e.g. `-ca0f029`), and `drizzle-kit` internally pins its expected `drizzle-orm` via a `workspace:` protocol reference specific to its own build — not a normal semver range. If your lockfile resolves a `drizzle-orm` snapshot hash that doesn't match the exact one `drizzle-kit` was built against, migration generation fails with:

```
TypeError: SQLiteSyncDialect is not a constructor
```

This is a known tooling incompatibility between the two packages' RC snapshot builds — not a bug in `nuxt-auto-crud`. Separately, the pairing that *can* generate migrations (`drizzle-kit`/`drizzle-orm` without a build-hash suffix) has its own unrelated runtime bug (`event.req.text is not a function`) that makes it unsuitable for actually running the app — so no single pairing currently works for both tasks.

### `migrate-fresh.sh`

A helper script (in the repo root) works around this: it temporarily strips the commit-hash suffix from `drizzle-orm`/`drizzle-kit` in `bun.lock`, generates migrations under that matching pairing, then discards the lockfile entirely and reinstalls from scratch — which reliably lands back on the pairing that runs the app correctly, even though nothing in `package.json` can pin that exact pairing directly.

```bash
chmod +x migrate-fresh.sh   # first run only

./migrate-fresh.sh              # generates migrations for playground (default)
./migrate-fresh.sh authz        # test/fixtures/authz
./migrate-fresh.sh basic        # test/fixtures/basic
./migrate-fresh.sh relations    # test/fixtures/relations
./migrate-fresh.sh all          # every valid target, one after another
./migrate-fresh.sh --list       # shows every valid target, without running anything
```

Targets are discovered automatically — any folder with its own `nuxt.config.ts` (either `playground/`, or a subfolder of `test/fixtures/`) is picked up without editing the script.

> ⚠️ **This deletes each target's existing database before regenerating.** For every target it runs against, the script removes that target's `.data/` (SQLite database file), `node_modules/`, and `.nuxt/` before running `nuxt db generate` — so any local data in that target's database is lost, not just the migration files. This is by design (it guarantees migrations are generated against a genuinely clean state), but `./migrate-fresh.sh all` will reset **every** fixture's local database at once.

**This is a temporary workaround, not a permanent fix.** Only `nuxt db generate` itself is affected — day-to-day development and testing run fine against whatever pairing your lockfile normally resolves. Once `drizzle-kit`/`drizzle-orm` publish a stable, version-aligned 1.0 release, this script (and this section) should no longer be necessary.

---