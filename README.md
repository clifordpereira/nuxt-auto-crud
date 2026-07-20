# nuxt-auto-crud (nac 2.x)

A Nuxt.js module providing dynamic **RESTful CRUD APIs** derived directly from your Drizzle schemas, without writing any code for CRUD operations.

---

## 🚀 Core Features

* **Zero-Codegen Dynamic RESTful CRUD APIs**: nuxt-auto-crud leverages Drizzle ORM, Zod, Nuxt, and Nitro to eliminate the need for manual CRUD coding.
* **Single Source of Truth (SSOT)**: Your Drizzle schemas (`server/db/schema`) define the entire API structure and validation.
* **Constant Bundle Size**: Since no code is generated, the bundle size remains virtually identical whether you have one table or one hundred (scaling only with your schema definitions).
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
  apiHiddenFields: ['created_by'], // these fields are hidden from all API responses globally
  apiWriteProtectedFields: ['created_by', 'updated_by'], // mass-assignment protection; ownerKey is always included automatically
  formHiddenFields: ['created_at', 'updated_at'], // @internal
  formReadOnlyFields: ['sku'], // @deprecated - instead configure at frontend
  agenticToken: '', // OPTIONAL. required to secure the /_meta endpoint
  nacEndpointPrefix: '/api/_nac', // @deprecated - use apiBase instead
  apiBase: '/api/_nac',
  schemaPath: 'server/db/schema',
}

```

> **Note**: Modify `apiBase` or `schemaPath` only if the Nuxt/Nitro conventions change.

### Per-Resource Field Overrides

`apiHiddenFields`, `formHiddenFields`, and `apiWriteProtectedFields` each accept either a flat array (applies to every table) or a scoped object for per-table control:

\```typescript
apiWriteProtectedFields: {
  default: ['created_by', 'updated_by'], // replaces the built-in default list; omit to keep it
  resources: {
    users: ['role_id'], // additionally protected, users table only
  },
},
\```

`resources` keys must be the **physical snake_case table name** — the same name used in routes (`/api/_nac/:model`) and in `publicResources` — not the camelCase name used in `relations.ts`'s `nacTableQueryConfig` (see note below).

---

## 🛡 Filtering & Performance Optimization

### Automatic Status Filtering

If `statusFiltering` is enabled, **nac** applies global visibility constraints. When a status column exists, queries are automatically restricted to `active` records. This logic integrates with the authorization layer, allowing users to see their own records (regardless of status) if they possess the `list_active` permission.

### Ownership & Permissions

While the implementing app handles the authentication & authorization layer, **nac** provides a standardized way to enforce record ownership and granular access.

If your middleware populates `event.context.nac` with `resourcePermissions`, **nac** automatically injects the necessary SQL filters.

**Example: Restricting users to their own records**
If the permissions array includes `'list_own'`, **nac** appends a filter where `ownerKey` (defaulting to `createdBy`) matches the `userId`.

If `list_active` is present, it applies a hybrid OR logic: users can see all active records OR any record they own, regardless of its status.

```typescript
// Example: Setting context in your Auth Middleware
event.context.nac = {
  userId: user.id,
  resourcePermissions: user.permissions[model], // e.g., ['list_own', 'list_active']
  record: null, // Optional: Pre-fetched record to prevent double-hitting the DB
}

```

### Optimization: Skip Redundant Fetches

If your middleware has already fetched the record, pass it to `event.context.nac.record` (as shown above). **nac** will use this object instead of executing an additional database query.

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

> ⚠️ **Casing note:** `nacTableQueryConfig` keys are the **camelCase schema export names** (e.g. `roleResourcePermissions`), matching Drizzle's `db.query[...]` API. This is different from `apiHiddenFields`/`apiWriteProtectedFields`'s per-resource `resources` keys, which use the **physical snake_case table name** (e.g. `role_resource_permissions`) — the same name used in routes. Double-check which casing applies before copying a key between the two.

---