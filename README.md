# nuxt-auto-crud (nac 3.x)

A Nuxt.js module providing dynamic **RESTful CRUD APIs** derived directly from your Drizzle schemas, without writing any code for CRUD operations.

---

## 🚀 Core Features

* **Zero-Codegen Dynamic RESTful CRUD APIs**: nuxt-auto-crud leverages Drizzle ORM, Zod, Nuxt, and Ni eliminate the need for manual CRUD coding.
* **Single Source of Truth (SSOT)**: Your Drizzle schemas (`server/db/schema`) define the entire API structure and validation.
* **Constant Bundle Size**: Since no code is generated, the bundle size remains virtually identical whether you have one table or one hundred (scaling only with your schema definitions).
---

---

## ⚠️ Upgrading to 3.0.0 — Breaking Change

**`GET` list endpoints (`/api/_nac/:model`) no longer return a bare array.** They now return:

```typescript
interface NacPaginatedResponse<T> {
  data: T[]
  meta: {
    mode: 'offset' | 'simple' | 'cursor'
    perPage: number
    total?: number       // only present when the request includes ?total=true
    page?: number         // present in 'offset' and 'simple' modes
    nextCursor?: string   // present in 'cursor' mode, when more results exist
    hasMore: boolean
  }
}
```

**Migration:** anywhere your frontend does `const items = await $fetch('/api/_nac/products')`, change it to:
```typescript
const { data: items } = await $fetch('/api/_nac/products')
```

This does **not** affect `GET /:model/:id`, `POST`, `PATCH`, or `DELETE` — those still return a single record object directly, unchanged.

**Why:** a bare array gave clients no way to know if more results existed without over-fetching, and no way to page reliably. 

**Fixes:**
* CRUD authorization (`create`/`read`/`update`/`delete`, and their `_own` variants) was previously enforced only on list operations — `nacGetRow`/`nacCreateRow`/`nacUpdateRow`/`nacDeleteRow` now consistently check permissions too.
* The `list_active` permission code has been renamed to `list`, matching the intended vocabulary (`list_all` / `list` / `list_own`) — update any `resourcePermissions` arrays your app supplies.

See [🛡 Filtering & Performance Optimization](#-filtering--performance-optimization) for the full CRUD permission model, and [📄 Pagination & Filtering](#-pagination--filtering) for the new response shape's fields.

---

## Supported Databases
* **SQLite (libSQL)**
* **MySQL**

---

## Installation Guide (SQLite)

### Option A: Starter Template
```bash
npx nuxi init -t gh:clifordpereira/nac-starter my-app
cd my-app
nuxt db generate
nuxt dev

```

### Option B: Manual Installation

```bash
bun create nuxt@latest my-app
cd my-app
npx nuxi module add hub
bun add drizzle-orm@rc @libsql/client nuxt-auto-crud
bun add -D drizzle-kit@rc typescript

```

#### Configuration

Update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    'nuxt-auto-crud'
  ],
  hub: {
    db: 'sqlite'
  }
})

```

#### Schema Definition

Define your schema in `server/db/schema.ts`:

```typescript
import { snakeCase, text, integer, numeric } from 'drizzle-orm/sqlite-core'

export const products = snakeCase.table('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sku: text('sku').notNull(),
  price: numeric('price', { mode: 'number' }).notNull(),
  stock: integer('stock').notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().$onUpdate(() => new Date()),
})

```

### Generate Migrations and Start Dev Server

```bash
nuxt db generate
nuxt dev

```

> For MySQL installation instructions, visit [INSTALLATION.md](https://github.com/clifordpereira/nuxt-auto-crud/blob/main/INSTALLATION.md).

### Authentication & Sensitive Fields

NAC automatically filters out `password` fields across all dynamic endpoints, as encryption and authentication logic are deferred to the implementing application.

Consequently, defining a `password` field as `notNull()` in your schema will trigger a database `NOT NULL constraint failed` error during record creation via NAC.

* **Production:** Handle authentication and password persistence in your application-level endpoints, keeping the field outside of NAC's automated scope.
* **Testing/Checkouts:** If you are testing the core module directly against a schema containing a password, mark the field as optional (nullable). NAC will then leave the column blank without throwing constraint errors.

### Conventions

NAC relies on specific naming conventions to enable zero-config relations and dynamic rendering:

* **Field Naming Case:** All database columns must use `snake_case`.
* **Dynamic Field Labels:** For parent-child relationship resolution, NAC dynamically falls back through a specific priority chain to resolve the text label of a record: `name` || `title` || `num` || `id`.
* **Custom Identifiers (e.g., Orders):** While most parent tables naturally expose a `name` or `title` column, tables utilizing tracking numbers (like `orders`) often use `order_number`. To leverage NAC's automatic label mapping for these schemas, name the column exactly `num` instead of `order_number`.

---

## 🌐 Data APIs (Dynamic RESTful CRUD)

> Note: All endpoints follow the pattern ${apiBase}/:model. By default, this is /api/_nac/:model.

| Method | Endpoint | Action |
| --- | --- | --- |
| **GET** | `/api/_nac/:model` | List records |
| **POST** | `/api/_nac/:model` | Create record with Zod validation |
| **GET** | `/api/_nac/:model/:id` | Fetch single record |
| **PATCH** | `/api/_nac/:model/:id` | Partial update with validation |
| **DELETE** | `/api/_nac/:model/:id` | Delete record |

**Example (`products` table):**

| Action | HTTP Method | Endpoint | Example Result |
| --- | --- | --- | --- |
| **Fetch All** | `GET` | `/api/_nac/products` | List of all products |
| **Create** | `POST` | `/api/_nac/products` | New product record added |
| **Fetch One** | `GET` | `/api/_nac/products/1` | Details of product with `id: 1` |
| **Update** | `PATCH` | `/api/_nac/products/1` | Partial update to product `1` |
| **Delete** | `DELETE` | `/api/_nac/products/1` | Product `1` removed from DB |

---

## 📄 Pagination & Filtering

`GET /api/_nac/:model` accepts query-string params for pagination and simple equality filtering.

### Pagination modes

| Mode | Triggered by | `meta` fields |
| --- | --- | --- |
| `simple` | No pagination params at all | `perPage`, `hasMore`, `page` |
| `offset` | `?page=` or `?offset=` present | `perPage`, `hasMore`, `page` |
| `cursor` | `?cursor=` present (and the table has an `id` column) | `perPage`, `hasMore`, `nextCursor` |

**Examples:**
`GET /api/_nac/products?limit=20` → mode: 'simple'
`GET /api/_nac/products?page=2&limit=20` → mode: 'offset'
`GET /api/_nac/products?offset=40&limit=20` → mode: 'offset'
`GET /api/_nac/products?cursor=118&limit=20` → mode: 'cursor'

**Fields:**
* **`limit`** — defaults to 50, capped at 200.
* **`hasMore`** — always present; computed by fetching one row past `limit`, at no extra query cost.
* **`total`** — a `COUNT(*)` query, so it's **opt-in only**: add `?total=true` to any request, regardless of mode, to include it.
* **Cursor pagination** returns `id`-descending results by default and only supports that default ordering — a resource whose `nacTableQueryConfig` sets a custom `orderBy` should use `offset`/`page` instead, since a cursor built against a different sort order would return a mismatched page.
* Cursor mode currently returns `nextCursor` only (forward paging). Backward navigation is left to the client keeping its own history of visited cursors — the same pattern used by Stripe and GitHub's REST APIs.

### Equality filtering

Any other query param matching a visible column name is applied as an equality filter, e.g. `?status=active`. Filters are resolved only against fields the caller can actually see (post hidden-field / public-resource narrowing) — an unrecognized or hidden key is silently ignored, never partially honored, so filtering can't be used to infer a hidden field's value.

---

## 🛠 Introspection & Metadata APIs

Use these endpoints to build dynamic UI components (like menus and forms) or provide context to AI agents. These use the `_schemas` and `_meta` reserved paths.

### 1. Discovery Endpoints

* **List Resource Names**: `GET /api/_nac/_schemas`
* Returns an array of all available table names. Useful for generating dynamic navigation menus.
* **Resource Metadata**: `GET /api/_nac/_schemas/:resource`
* Returns field definitions, validation rules, and `readonly` status for a specific table.
* **Example:** `GET /api/_nac/_schemas/products` returns the schema for the products table.

#### Schema Interface

```typescript
export interface Field {
  name: string
  type: string
  required?: boolean
  selectOptions?: string[]
  references?: string
  readonly?: boolean
}

export interface SchemaDefinition {
  resource: string
  labelField: string
  fields: Field[]
}

```

#### Example Response

`GET /api/_nac/_schemas/products`

```json
{
  "resource": "products",
  "labelField": "name",
  "fields": [
    { "name": "id", "type": "number", "required": true, "readonly": true },
    { "name": "name", "type": "string", "required": true, "readonly": false },
    { "name": "sku", "type": "string", "required": true, "readonly": false },
    { "name": "price", "type": "number", "required": true, "readonly": false },
    { "name": "stock", "type": "number", "required": true, "readonly": false }
  ]
}

```

### 2. Agentic Discovery

* **Manifest**: `GET /api/_nac/_meta?format=md`
* Returns a token-efficient Markdown manifest for LLM context injection.
* **Security:** Requires `NUXT_AUTO_CRUD_AGENTIC_TOKEN` (min 16 characters) in your `.env`.

---

## 🛡 Security & Configuration

Enabling `authentication` in the `autoCrud` config protects all **nac** routes (`/api/_nac/*`), except those explicitly defined in `publicResources`.

### 🔒 Access Control & Data Safety

* **`apiHiddenFields`**: Globally hides sensitive columns from all API responses (read). Default: ['password', 'secret', 'token', 'resetToken', 'resetExpires', 'githubId', 'googleId'].
* **`apiWriteProtectedFields`**: Server-enforced — fields a client can never set via `POST`/`PATCH` body, regardless of the frontend (mass-assignment protection). `auth.ownerKey` is always protected automatically, even if not listed explicitly.
* **`formHiddenFields`**: Columns excluded from the `_schemas` metadata response, as a UI hint only. This does **not** block writes — use `apiWriteProtectedFields` for that.
* **`formReadOnlyFields`** *(deprecated)*: Was intended as a UI-only hint and was never enforced server-side. Manage read-only state in your frontend instead (e.g. `nuxt-crud-table`).

### ⚙️ Configuration Reference

| Key | Default | Description |
| --- | --- | --- |
| `statusFiltering` | `false` | Enables/disables automatic filtering of records based on the `status` column. |
| `realtime` | `false` | Enables real-time broadcasting of all Create, Update, and Delete (CUD) operations via SSE. |
| `auth.authentication` | `false` | Requires a valid session for all NAC routes. |
| `auth.authorization` | `false` | Enables role/owner-based access checks. |
| `auth.ownerKey` | `'createdBy'` | The column name used to identify the record creator. |
| `publicResources` | `{}` | Defines tables and specific columns accessible without auth. |
| `apiHiddenFields` | `NAC_API_HIDDEN_FIELDS` | Arrays of keys to exclude from all API responses. |
| `apiWriteProtectedFields` | `NAC_API_WRITE_PROTECTED_FIELDS` | Server-enforced fields a client can never set on create/update. `auth.ownerKey` is always included automatically. |
| `formHiddenFields` | `NAC_FORM_HIDDEN_FIELDS` | Arrays of keys to exclude from dynamic forms. |
| `formReadOnlyFields` | `NAC_FORM_READ_ONLY_FIELDS` | @deprecated — unenforced server-side. Configure in your frontend instead. |
| `agenticToken` | `''` | Secret key used to secure the /_meta endpoint, preventing unauthorized AI agents from introspecting your schema. |
| `nacEndpointPrefix` | `'/api/_nac'` | @deprecated Use `apiBase` instead. |
| `apiBase` | `'/api/_nac'` | The base path for NAC routes. Access via `useRuntimeConfig().public.autoCrud`. |
| `schemaPath` | `'server/db/schema'` | Location of your Drizzle schema files. |

### Example `nuxt.config.ts`

```typescript
autoCrud: {
  statusFiltering: false,
  realtime: false,
  auth: {
    authentication: false,
    authorization: false,
    ownerKey: 'createdBy', // change it if you want to use another column eg: ownerId
  },
  publicResources: {
    // guest users can access these tables and fields without authentication, even when auth.athentication is true
    products: ['id', 'name', 'sku', 'price'],
  },
  apiHiddenFields: ['createdBy'], // these fields are hidden from all API responses globally
  apiWriteProtectedFields: ['createdBy', 'updatedBy'], // mass-assignment protection; ownerKey is always included automatically
  formHiddenFields: ['createdAt', 'updatedAt'], // @deprecated: instead configure at frontend
  formReadOnlyFields: ['sku'], // @deprecated: instead configure at frontend
  agenticToken: '', // OPTIONAL. required to secure the /_meta endpoint
  nacEndpointPrefix: '/api/_nac', // @deprecated: instead use apiBase
  apiBase: '/api/_nac',
  schemaPath: 'server/db/schema',
}

```

> **Note**: Modify `apiBase` or `schemaPath` only if the Nuxt/Nitro conventions change.

### Per-Resource Field Overrides

`apiHiddenFields`, `formHiddenFields`, and `apiWriteProtectedFields` each accept either a flat array (applies to every table) or a scoped object for per-table control:

```typescript
apiWriteProtectedFields: {
  default: ['createdBy', 'updatedBy'], // replaces the built-in default list; omit to keep it
  resources: {
    users: ['roleId'], // additionally protected, users table only
  },
},
```


#### Casing flexibility

Both the `resources` object's **keys** and its **field-name values** accept either casing:

* **Table keys** — the physical snake_case table name (e.g. `role_resource_permissions`) or the camelCase schema export name (e.g. `roleResourcePermissions`) both resolve to the same table.
* **Field names** — snake_case (e.g. `role_id`) or camelCase (e.g. `roleId`) both resolve to the same column, regardless of how that column happens to be declared in your schema.

Both of these are equally valid — different casing, same table, same fields:

```typescript
apiWriteProtectedFields: {
  resources: {
    role_resource_permissions: ['roleId', 'resourceId'],
  },
},

// or, identically:
apiWriteProtectedFields: {
  resources: {
    roleResourcePermissions: ['role_id', 'resource_id'],
  },
},
```

`publicResources` follows the same rule for both its keys and values.

---

## 🛡 Filtering & Performance Optimization

### CRUD Authorization

When `auth.authorization` is enabled, every operation is gated by `event.context.nac.resourcePermissions` — a flat array of codes scoped to the current resource, supplied by your app's own middleware (see [Authorization Middleware](#authorization-middleware) below).

| Code | Grants |
| --- | --- |
| `create` | Create records |
| `read` / `read_own` | Read any record / only records you own |
| `update` / `update_own` | Update any record / only records you own |
| `delete` / `delete_own` | Delete any record / only records you own |
| `list_all` | List all records, full bypass |
| `list` | List records, respecting `statusFiltering` if enabled |
| `list_own` | List only records you own |

A caller with neither the full nor `_own` code for an operation is rejected with `403`. For `_own`-scoped read/update/delete, a request against a record the caller doesn't own returns **`404`, not `403`** — this is deliberate: it never confirms a not-owned record's existence to a caller who isn't authorized to see it.

### Automatic Status Filtering

If `statusFiltering` is enabled, **nac** applies global visibility constraints. When a status column exists, queries are automatically restricted to `active` records. When both `statusFiltering` and the `list` permission apply together, hybrid OR logic is used: a caller sees all active records OR any record they own, regardless of its status.

### Authorization Middleware

Populate `event.context.nac` from your own app's session/permission logic, before NAC's own guard runs. `nacGetModelFromPath` (exported from `nuxt-auto-crud`) resolves the `:model` a request targets, so your middleware never needs to re-implement NAC's route parsing:

```typescript
// server/middleware/00.nac-permissions.ts
// import { nacGetModelFromPath } from 'nuxt-auto-crud'

export default defineEventHandler(async (event) => {
  const model = nacGetModelFromPath(event.path)
  if (!model) return // not a NAC route

  const user = await resolveSessionUser(event) // your own session logic, eg: getUserSession() from nuxt-auth-utils
  if (!user) return

  // Merge, don't overwrite — NAC's own guard may already have set
  // event.context.nac.isPublic before or after this runs.
  event.context.nac = {
    ...event.context.nac,
    userId: user.id,
    resourcePermissions: await resolvePermissionsForModel(user, model), // eg: user.permissions[model] (store permissions in user on login)
  }
})
```

### Optimization: Skip Redundant Fetches

If your middleware has already fetched the record, pass it to `event.context.nac.record` — **nac** will use this object instead of executing an additional database query.

---

## 📡 Real-time Synchronization (SSE)

When `realtime` is enabled, all `create`, `update`, and `delete` operations are automatically broadcasted:

```typescript
if (realtime) {
  void broadcast({
    table: model,
    action: 'create',
    primaryKey: newRecord.id,
    data: newRecord,
  })
}

```

### Frontend Usage

NAC provides a `useNacAutoCrudSSE` composable to listen for these changes in your frontend:

```typescript
useNacAutoCrudSSE(({ table, action, data: sseData, primaryKey }) => {
  // Optional: Filter by specific table
  if (table !== 'products') return

  if (action === 'update') {
    // updateRow(primaryKey, sseData)
  }

  if (action === 'create') {
    // addRow(sseData)
  }

  if (action === 'delete') {
    // removeRow(primaryKey)
  }
})

```

## 🔗 Relations Support

`nuxt-auto-crud` natively supports Drizzle ORM relations, allowing you to fetch nested relational graphs, exclude or pick specific columns, and apply relational ordering automatically.

### 1. Update `nuxt.config.ts`

Define the path to your relations file in the module configuration options:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-auto-crud'],
  autoCrud: {
    relationsPath: 'server/db/relations', // Specify the path to your relations configuration
  },
})

```

### 2. Define Relations & Query Configurations

Create your relations file (e.g., `server/db/relations.ts`).

> ⚠️ **Important Notes:**
> * `nuxt-auto-crud` utilizes the Drizzle RC API, so you must define relations using **`defineRelations()`** instead of the older `relations()` wrapper.
> * Your relations config map and query setup must be strictly exported as **`relations`** and **`nacTableQueryConfig`** respectively.
> * Any valid Drizzle `DBQueryConfig` parameter is supported in `nacTableQueryConfig`.
>
example for nacTableQueryConfig
```ts
// in relations.ts after your normal relations code
export const nacTableQueryConfig: Record<string, DBQueryConfig> = {
  users: {
    with: {
      role: { columns: { name: true } },
    },
  },
  roleResourcePermissions: {
    columns: {
      roleId: false,
      resourceId: false,
      permissionId: false,
    },
    with: {
      role: { columns: { name: true } },
      resource: { columns: { name: true } },
      permission: { columns: { code: true } },
    },
  },
}
```

[A full example of relations.ts](https://github.com/clifordpereira/nuxt-auto-crud/blob/main/playground/server/db/relations.ts)

> ⚠️ **Casing note:** `nacTableQueryConfig` keys are matched primarily by the camelCase schema export name (e.g. `roleResourcePermissions`), matching Drizzle's `db.query[...]` API — but NAC also falls back to the physical snake_case table name (e.g. `role_resource_permissions`) if no camelCase entry is found, so either form works here too. This matches the same casing flexibility as `apiHiddenFields`/`apiWriteProtectedFields`'s `resources` keys (see [Per-Resource Field Overrides](#per-resource-field-overrides) above) — you no longer need to track which casing rule applies to which config surface.

---

## Troubleshooting
### For apps using `nuxt-auto-crud`

If you hit the same `drizzle-kit`/`drizzle-orm` version mismatch in your own project, a bun-based fixer script ships with this package:

```bash
npx nac-migrate-fresh
```

Run it from your app's root (where your `bun.lock` lives). It's bun-specific — see the script's own header comment (`node_modules/.bin/nac-migrate-fresh` after install, or view it [on GitHub](https://github.com/clifordpereira/nuxt-auto-crud/blob/main/bin/migrate-fresh.sh)) for more details.