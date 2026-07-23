# nuxt-auto-crud (NAC) — Technical Documentation

**Version reference:** 2.x (agentic manifest `1.0.0-agentic`)
**Scope:** This document describes the module's architecture, configuration, request lifecycle, and API surface as implemented in the current source, and closes with an audit of discrepancies found between the code, the type definitions, and the README/INSTALLATION docs.

---

## 1. Overview

`nuxt-auto-crud` is a Nuxt module that inspects Drizzle ORM schema exports and generates RESTful CRUD endpoints and introspection metadata for each table, with no per-table code required. It hooks into Nitro via:

- A **security middleware** (`nac-guard`) registered globally.
- A set of **server route handlers** registered under a configurable API prefix.
- **Runtime config** split into a private (server-only) half and a public (client-exposed) half.
- Optional **Drizzle relational queries**, **Server-Sent Events (SSE) broadcasting**, and an **agentic Markdown manifest** for LLM consumption.

## 2. Directory Structure

```
src/
 runtime/
  composables/
   useNacApiBase.ts
   useNacAutoCrudSSE.ts
  server/
   api/_nac/
    _schemas/
     [model].get.ts       # single-resource schema introspection
     index.get.ts         # list of resource names
    [model]/
     [id].delete.ts
     [id].get.ts
     [id].patch.ts
     index.get.ts         # list rows
     index.post.ts        # create row
    _meta.get.ts           # agentic manifest (JSON or Markdown)
    _sse.get.ts             # SSE stream
   middleware/
    nac-guard.ts            # auth/authz interceptor
   stubs/
    empty-stub.ts           # fallback when no relations file is configured
   utils/
    constants.ts
    db.ts
    modelMapper.ts
    queries.ts
    sse-bus.ts
    validator.ts
   exceptions.ts
   types.ts
  shared/utils/
   types.ts
  types/
   index.d.ts
 module.ts
 types.ts

playground/
 server/db/
  relations.ts
  schema.ts
```

Note: there are two files literally named `index.get.ts` in the tree — one under `[model]/` (returns rows for a resource) and one under `_schemas/` (returns the list of resource names). They are unrelated in behavior; disambiguate by directory, not filename, when reading the source.

## 3. Module Registration (`module.ts`)

On `setup()`:

1. **Aliases** — `#nac/schema` and `#nac/relations` are resolved to the user's configured paths (or to `empty-stub.ts` when `relationsPath` is unset). `#nac/db` is resolved to the internal DB utility.
2. **Runtime config split**:
   - `runtimeConfig.autoCrud` (private/server-only): everything except `formHiddenFields`, `formReadOnlyFields`, `nacEndpointPrefix`, `apiBase`.
   - `runtimeConfig.public.autoCrud` (client-exposed): `formHiddenFields`, `formReadOnlyFields`, `nacEndpointPrefix`, `apiBase`.
3. **Auto-imports** — composables directory and server utils directory are registered for auto-import.
4. **Type augmentation** — `runtime/types/index.d.ts` is pushed into `prepare:types`.
5. **Guard middleware** — `nac-guard` is registered globally as Nitro middleware (runs on every request, self-filters by path prefix).
6. **Route registration** — CRUD and system routes are registered under:
   ```ts
   const prefix = options.apiBase || options.nacEndpointPrefix || '/api/_nac'
   ```

## 4. Configuration Reference

| Key | Type | Default | Scope | Description |
| --- | --- | --- | --- | --- |
| `statusFiltering` | `boolean` | `false` | private | Auto-filters list queries to `status = 'active'` when a `status` column exists. |
| `realtime` | `boolean` | `false` | private | Broadcasts create/update/delete events over SSE. |
| `schemaPath` | `string` | `'server/db/schema'` | private | Path to Drizzle schema exports. |
| `relationsPath` | `string?` | `undefined` | private | Path to Drizzle relations config (`relations` + `nacTableQueryConfig` exports). |
| `auth.authentication` | `boolean` | `false` | private | Requires `event.context.nac.userId` on non-public routes. |
| `auth.authorization` | `boolean` | `false` | private | Enables `resourcePermissions`-based row filtering. |
| `auth.ownerKey` | `string` | `'createdBy'` | private | Column used for ownership filters and auto-stamping on create/update. |
| `apiHiddenFields` | `string[]` | see `NAC_API_HIDDEN_FIELDS` | private | Columns stripped from **every** API response. |
| `agenticToken` | `string` | `''` | private | Shared secret required as a `?token=` query param on `/_meta`. |
| `publicResources` | `Record<string,string[]>` | `{}` | private | Tables (and optionally columns) reachable without authentication. |
| `formHiddenFields` | `string[]` | see `NAC_FORM_HIDDEN_FIELDS` | public | Columns omitted from `_schemas` metadata and from insert/patch validation. |
| `formReadOnlyFields` | `string[]` | `[]` | public | Columns marked `readonly: true` in `_schemas` metadata (UI hint only, not enforced server-side). |
| `nacEndpointPrefix` | `string` | `'/api/_nac'` | public | **Deprecated.** Base path for all NAC routes. |
| `apiBase` | `string` | `'/api/_nac'` | public | Base path for all NAC routes (replacement for `nacEndpointPrefix`). |

Default hidden-field sets (`constants.ts`):

```ts
NAC_API_HIDDEN_FIELDS  = ['password','secret','token','resetToken','resetExpires','githubId','googleId']
NAC_FORM_HIDDEN_FIELDS = [...NAC_API_HIDDEN_FIELDS, 'id','uuid','createdAt','updatedAt','deletedAt','createdBy','updatedBy']
NAC_FORM_READ_ONLY_FIELDS = []
NAC_SYSTEM_TABLES = ['_hub_migrations','d1_migrations','sqlite_sequence']
```

## 5. Request Lifecycle & Security (`nac-guard.ts`)

For every request:

1. Resolve `pathname`. If it doesn't start with the configured prefix, the middleware is a no-op.
2. Initialize `event.context.nac ||= { userId: null, isPublic: false }`.
3. **Agentic paths** (pathname includes `/_meta`): require a timing-safe-equal `token` query param matching `agenticToken`. `agenticToken` must be ≥16 chars or all tokens are rejected.
4. **All other NAC paths**: if `auth.authentication` is on and the request is unauthenticated, the target model is extracted from the path and checked against `publicResources`. If not public, a 401 is thrown; otherwise `context.nac.isPublic = true`.

Route handlers then consult `event.context.nac` to run `nacResolveAuthorizationFilters()` (owner/status filtering) and `getSelectableFields()` (column hiding/public-field allow-listing).

## 6. CRUD Endpoints

| Method | Path | Handler | Behavior |
| --- | --- | --- | --- |
| GET | `${apiBase}/:model` | `[model]/index.get.ts` | Lists rows via `nacGetRows`, applying visibility filters and field selection. |
| POST | `${apiBase}/:model` | `[model]/index.post.ts` | Validates body with `nacResolveValidatedSchema(table, 'insert')`, inserts, broadcasts if `realtime`. |
| GET | `${apiBase}/:model/:id` | `[model]/[id].get.ts` | Fetches one row; reuses `context.record` if pre-populated upstream. |
| PATCH | `${apiBase}/:model/:id` | `[model]/[id].patch.ts` | Validates body with `nacResolveValidatedSchema(table, 'patch')` (all fields optional), updates, broadcasts. |
| DELETE | `${apiBase}/:model/:id` | `[model]/[id].delete.ts` | Deletes and returns the removed record, broadcasts. |

Unknown `model` values throw `NacResourceNotFoundError` (404) from `nacModelTableMap` lookups.

## 7. Introspection & Agentic Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `${apiBase}/_schemas` | List of all resource (table) names. |
| GET | `${apiBase}/_schemas/:model` | Field-level schema definition (`NacSchemaDefinition`) for one resource. |
| GET | `${apiBase}/_meta` | Full manifest across all resources. Add `?format=md` or send `Accept: text/markdown` for an LLM-optimized Markdown table. Requires `agenticToken`. |
| GET | `${apiBase}/_sse` | Server-Sent Events stream of CRUD mutations (20s keep-alive ping). |

`NacField` shape:

```ts
interface NacField {
  name: string
  type: string
  required?: boolean
  selectOptions?: string[]
  references?: string
  readonly?: boolean
}
```

## 8. Query Engine (`queries.ts`)

- `nacGetRows` — authorization gate → visibility filters (`nacResolveAuthorizationFilters`) → column selection (`getSelectableFields`) → either Drizzle **relational query mode** (if `hasActiveRelations()`) or a plain `select().from().orderBy(desc(id))`.
- `nacGetRow` — short-circuits via `context.record` if present (avoids a duplicate DB hit); otherwise selects by numeric `id`.
- `nacCreateRow` / `nacUpdateRow` — auto-stamp `ownerKey`/`updatedBy`/`updatedAt` when those columns exist and `context.userId` is set; MySQL and SQLite/libSQL paths diverge because MySQL's driver doesn't support `.returning()`.
- `nacDeleteRow` — MySQL path pre-fetches the row (since MySQL can't `.returning()` on delete) before issuing the delete.

## 9. Field Visibility Model

Two independent filtering layers exist and are **not** interchangeable:

- `apiHiddenFields` (private config) — enforced in `getSelectableFields()`, applied to every response regardless of caller.
- `formHiddenFields` / `formReadOnlyFields` (public config) — enforced only in `nacGetSchemaDefinition()` (what forms *see*) and `nacResolveValidatedSchema()` (what inserts/patches *accept*). These do not affect what `GET`/list responses actually return.

`publicResources[model]` acts as a column allow-list that only takes effect when `context.isPublic === true` (i.e., the caller was let through by `nac-guard` without authenticating).

## 10. Realtime (SSE)

When `realtime: true`, `index.post.ts`, `[id].patch.ts`, and `[id].delete.ts` call `nacBroadcast()` with `{ table, action, primaryKey, data }`. Clients subscribe via the `useNacAutoCrudSSE` composable, which:

- No-ops during SSR.
- Opens `EventSource` at `${apiBase}/_sse` on mount, closes it on unmount.
- Listens for the `crud` named event and JSON-parses `event.data`.

## 11. Relations Support

If `relationsPath` is configured, the file must export `relations` (via Drizzle's `defineRelations`) and `nacTableQueryConfig` (a `Record<tableName, DBQueryConfig>`). `hasActiveRelations()` gates whether `nacGetRows` uses the relational query API (`db.query[tableName].findMany`) versus the flat `select()` path. Per-table query config (e.g. `with`, custom `columns`, `orderBy`) is merged on top of the field selection derived from `apiHiddenFields`.

## 12. Composables

- `useNacApiBase()` — reads `runtimeConfig.public.autoCrud`, returns `apiBase || nacEndpointPrefix || '/api/_nac'`.
- `useNacAutoCrudSSE(onEvent)` — see §10.

## 13. Error Model

All thrown errors extend `NacAutoCrudError` (has `statusCode`, `.toH3()`). Notable subclasses: `NacAuthenticationError` (401), `NacUnauthorizedAccessError` (403), `NacValidationError` (400), `NacResourceNotFoundError` / `NacRecordNotFoundError` (404), `NacRecordAlreadyExistsError` (409), `NacInsertionFailedError` / `NacUpdateFailedError` / `NacDeletionFailedError` (500).

---

## 14. Discrepancies, Inconsistencies & Recommendations

### 14.1 Critical — `nac-guard.ts` never reads `apiBase`

`module.ts` computes the active route prefix as `options.apiBase || options.nacEndpointPrefix`, and `useNacApiBase()` (client composable) mirrors that same fallback. But `nac-guard.ts` does:

```ts
const { nacEndpointPrefix } = config.public.autoCrud
if (!isNacPath(pathname, nacEndpointPrefix)) return
```

It only ever reads the **deprecated** `nacEndpointPrefix`, never `apiBase`. Since both default to `/api/_nac`, this is invisible out of the box — but if a user sets only `apiBase` (as the docs tell them to, since `nacEndpointPrefix` is marked deprecated) to a custom value, `nacEndpointPrefix` stays at its default `/api/_nac`. The guard then fails to recognize the real routes as NAC paths at all, and **authentication/authorization silently stops being enforced** on every endpoint, including `_meta`'s agentic-token check (since `isAgenticPath` is only reached after `isNacPath` passes).

**Recommendation:** Change `nac-guard.ts` to resolve the prefix the same way `module.ts` and `useNacApiBase.ts` do:
```ts
const { apiBase, nacEndpointPrefix } = config.public.autoCrud
const prefix = apiBase || nacEndpointPrefix || '/api/_nac'
```
and use `prefix` everywhere `nacEndpointPrefix` is currently used (`isNacPath`, `getModelName`). This is the highest-priority fix — it's a security-relevant divergence between three places that are supposed to agree on one value.

### 14.2 High — relation-mode `columns` can bypass `apiHiddenFields`

In `nacGetRows`, relation-mode column selection is:
```ts
columns: { ...columns, ...queryOptions.columns }
```
`columns` is the hidden-field-filtered set from `getSelectableFields()`, but `queryOptions.columns` (from `nacTableQueryConfig`, user-authored) is spread **after** it and wins on conflict. A developer who writes `columns: { password: true }` in their relations config for convenience will re-expose a column that `apiHiddenFields` was supposed to permanently strip — the "hidden fields" guarantee is not enforced in relation mode.

**Recommendation:** Either filter `queryOptions.columns` through `apiHiddenFields` before merging, or explicitly document that `nacTableQueryConfig.columns` can override hidden-field protection and must not reference sensitive columns.

### 14.3 Medium — README's config table omits `apiBase`

The `README.md` "Configuration Reference" table lists `nacEndpointPrefix` (and calls out `apiBase` only in prose as its replacement) but does not give `apiBase` its own row with default/description. Combined with §14.1, a user following the README literally (configure `apiBase`, ignore the deprecated field) is the exact path that breaks auth enforcement.

**Recommendation:** Add an explicit `apiBase` row to the config table, mark `nacEndpointPrefix` as deprecated in the table itself, and add a callout that both values are currently read by *different* internal modules until §14.1 is fixed.

### 14.4 Medium — "skip redundant fetch" optimization is GET-only

README's "Optimization: Skip Redundant Fetches" section describes passing `event.context.nac.record` to avoid a duplicate DB read, with a generic example under the ownership/permissions section (not scoped to one HTTP verb). In the implementation, only `nacGetRow` (used by `GET /:model/:id`) actually checks `context.record`. `nacUpdateRow` and `nacDeleteRow` always hit the database directly and ignore `context.record`.

**Recommendation:** Either extend the optimization to `PATCH`/`DELETE`, or scope the README section explicitly to "single-record GET" so users don't assume it applies to updates/deletes.

### 14.5 Medium — reserved path names can collide with real table names

`nac-guard.ts`'s `getModelName()` regex-extracts the path segment immediately after the prefix for every non-agentic path, including `_schemas` and `_sse`. If a schema ever exports a table literally named `_schemas`, `_sse`, or `_meta`, its CRUD routes would be shadowed by the system routes registered in `module.ts` (Nitro route registration order / specificity would determine which wins), and the guard's public-resource check would be evaluated against the wrong "model" for the system endpoints.

**Recommendation:** Add `_schemas`, `_meta`, `_sse` to `NAC_SYSTEM_TABLES` (or a similar reserved-name list) and reject/rename schema exports that collide with them, ideally with a clear startup-time warning from `module.ts`.

### 14.6 Low — `formReadOnlyFields` is a UI hint only, not enforced

`nacGetSchemaDefinition()` marks a field `readonly: true` for `formReadOnlyFields` entries, but nothing in `nacResolveValidatedSchema()` (used by the actual POST/PATCH handlers) omits or rejects those fields — a client that ignores the `readonly` hint and sends the field anyway will have it written. This matches the README's own caveat ("UI only") for `formReadOnlyFields`, but it is easy to miss and worth stating directly in the config reference table, not just in the example comment.

**Recommendation:** Either enforce `formReadOnlyFields` server-side (strip incoming values for those keys in `nacResolveValidatedSchema`), or make the "UI-only, not enforced server-side" caveat explicit in the config table (§4) rather than only in an inline code comment.

### 14.7 Low — `id` marked `readonly` is unreachable

`nacGetSchemaDefinition()` sets `readonly: publicAutoCrud.formReadOnlyFields.includes(name) || name === 'id'`, but `id` is already excluded from `fields` earlier in the same function because `id` is part of the default `NAC_FORM_HIDDEN_FIELDS`. The `name === 'id'` readonly branch can therefore never execute under default config, and only matters if a consumer removes `'id'` from a custom `formHiddenFields` override.

**Recommendation:** Either remove the dead branch, or add a comment explaining it exists only to protect against custom `formHiddenFields` overrides that re-include `id`.

### 14.8 Low — stray review comment left in source

`queries.ts`, `nacDeleteRow`:
```ts
const fields = getSelectableFields(table, context) // was: getSelectableFields(table)
...
const recordToDelete = await nacGetRow(table, id, context) // was: nacGetRow(table, id)
```
These look like leftover code-review artifacts rather than intentional documentation.

**Recommendation:** Remove the `// was: ...` comments before release; they add no information for future maintainers and can be confused with TODOs.

### 14.9 Low — inconsistent column-naming convention between README and playground fixture

The README's quick-start schema example uses camelCase columns (`createdAt`, `updatedAt`), while the actual `playground/server/db/schema.ts` fixture (and its `relations.ts`) uses snake_case (`created_at`, `customer_id`). Both are valid Drizzle usage, but since NAC's default `apiHiddenFields`/`formHiddenFields` lists are camelCase (`createdAt`, `updatedBy`, etc.), a snake_case schema like the playground's won't actually get those columns auto-hidden — the default lists simply won't match `created_at`.

**Recommendation:** Either note in the README that the default hidden-field lists assume camelCase columns and must be customized for snake_case schemas, or normalize the playground fixture to camelCase to match the documented default behavior.

### 14.10 Informational — no pagination on list endpoint

`nacGetRows` returns the full result set ordered by `id desc` with no `limit`/`offset`/cursor support. Not a discrepancy against current docs (none is promised), but worth flagging as a scalability gap if `nac-starter` templates are used against non-trivial tables.

---

## 15. Summary of Recommended Fixes (Priority Order)

1. **Fix `nac-guard.ts` to resolve `apiBase` before `nacEndpointPrefix`**, matching `module.ts`/`useNacApiBase.ts` (§14.1 — security-relevant).
2. **Constrain `nacTableQueryConfig.columns` against `apiHiddenFields`** in relation mode (§14.2 — security-relevant).
3. Update `README.md` config table to include `apiBase` explicitly and flag the current internal inconsistency until fix #1 ships (§14.3).
4. Clarify scope of the "skip redundant fetch" optimization to GET-only, or extend it to PATCH/DELETE (§14.4).
5. Reserve `_schemas`, `_meta`, `_sse` as system table names (§14.5).
6. Document (or enforce) that `formReadOnlyFields` is not server-enforced (§14.6).
7. Minor cleanups: dead `id` readonly branch (§14.7), stray review comments (§14.8), naming-convention note (§14.9).