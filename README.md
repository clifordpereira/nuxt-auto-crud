# nuxt-auto-crud (nac 2.x)

**Zero-Codegen Dynamic RESTful CRUD APIs** derived directly from schemas. It eliminates the need to manually write or generate boilerplate for CRUD operations.

---

## 🚀 Core Features

* **Zero-Codegen Dynamic RESTful CRUD APIs**: nuxt-auto-crud leverages Drizzle ORM, Zod, Nuxt, and Nitro to eliminate the need for manual CRUD coding.
* **Single Source of Truth (SSOT)**: Your Drizzle schemas (`schema/db/schema`) define the entire API structure and validation.
* **Constant Bundle Size**: Since no code is generated, the bundle size remains virtually identical whether you have one table or one hundred (scaling only with your schema definitions).
---

## Installation Guide

```bash
bun create nuxt@latest my-app
npx nuxi module add hub
bun add drizzle-orm@beta @libsql/client nuxt-auto-crud
bun add -D drizzle-kit@beta

```

### Configuration

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

### Schema Definition

Define your schema in `server/db/schema.ts`:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  avatar: text().notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

```

### Initialize and Run

```bash
nuxi db generate
nuxi dev

```

---

## 🌐 Dynamic RESTful CRUD endpoints

Nb: Endpoints follow the pattern `/api/_nac/:model`.

| Method | Endpoint | Action |
| --- | --- | --- |
| **GET** | `/:model` | List records (supports filtering & pagination) |
| **POST** | `/:model` | Create record with Zod validation |
| **GET** | `/:model/:id` | Fetch single record |
| **PATCH** | `/:model/:id` | Partial update with validation |
| **DELETE** | `/:model/:id` | Hard delete |

**Example (`users` table):** 

| Action | HTTP Method | Endpoint | Example Result |
| --- | --- | --- | --- |
| **Fetch All** | `GET` | `/api/_nac/users` | List of all users (paginated) |
| **Create** | `POST` | `/api/_nac/users` | New user record added |
| **Fetch One** | `GET` | `/api/_nac/users/1` | Details of user with `id: 1` |
| **Update** | `PATCH` | `/api/_nac/users/1` | Partial update to user `1` |
| **Delete** | `DELETE` | `/api/_nac/users/1` | User `1` hard deleted from DB |

---

## 🛠 Frontend Integration APIs

In addition to CRUD endpoints, **nac** provides metadata APIs to power dynamic forms and tables in your frontend.

* **List Resources**: `GET /api/_nac/_schemas` returns all tables (excluding system-protected tables).
* **Resource Metadata**: `GET /api/_nac/_schemas/:resource` returns the field definitions, validation rules, and relationship data for a specific table.

---

### Schema Interface

```typescript
export interface Field {
  name: string
  type: string
  required?: boolean
  selectOptions?: string[]
  references?: string
  isReadOnly?: boolean
}

export interface SchemaDefinition {
  resource: string
  labelField: string
  fields: Field[]
}

```

### Example Response

`GET /api/_nac/_schemas/users`

```json
{
  "resource": "users",
  "labelField": "name",
  "fields": [
    { "name": "id", "type": "string", "required": true, "isReadOnly": true },
    { "name": "name", "type": "string", "required": true, "isReadOnly": false },
    { "name": "email", "type": "string", "required": true, "isReadOnly": false }
  ]
}

```
---

## 🛡 Security & Configuration

Enabling `authentication` in the `autoCrud` config protects all **nac** routes (`/api/_nac/*`), except those explicitly defined in `publicResources`.

### 🔒 Access Control & Data Safety

* **`apiHiddenFields`**: Globally hides sensitive columns from all API responses. Default: `['password', 'secret', 'token', 'reset_token', 'reset_expires', 'github_id', 'google_id']`.
* **`formHiddenFields`**: Columns excluded from the frontend schema metadata to prevent user input. Defaults to `apiHiddenFields` plus system-managed fields like `id`, `uuid`, `createdAt`, `updatedAt`, `createdBy`, etc.
* **Response Scrubbing**: If a field is in `apiHiddenFields` or does not exist in the schema, it is silently stripped from the response even if listed in `publicResources`.

---

### ⚙️ Configuration Reference

| Key | Default | Description |
| --- | --- | --- |
| `realtime` | `false` | Enables/disables real-time capabilities. |
| `auth.authentication` | `true` | Requires a valid session for all NAC routes. |
| `auth.authorization` | `true` | Enables role/owner-based access checks. |
| `auth.ownerKey` | `'ownerId'` | The column name used to identify the record creator. |
| `publicResources` | `{}` | Defines tables and specific columns accessible without auth. |
| `nacEndpointPrefix` | `'/api/_nac'` | The base path for NAC routes. Access via `useRuntimeConfig().public.autoCrud`. |
| `schemaPath` | `'server/db/schema'` | Location of your Drizzle schema files. |

### Example `nuxt.config.ts`

```typescript
autoCrud: {
  realtime: false,
  auth: {
    authentication: true,
    authorization: true,
    ownerKey: 'ownerId', 
  },
  publicResources: {
    users: ['id', 'name', 'email'],
  },
  apiHiddenFields: ['password'], 
  agenticToken: process.env.NAC_AGENTIC_TOKEN, 
  formHiddenFields: [], 
  nacEndpointPrefix: '/api/_nac',
  schemaPath: 'server/db/schema',
}

```

> **Note**: Modify `nacEndpointPrefix` or `schemaPath` only if the Nuxt/Nitro conventions change.
---

## 🛡 Filtering & Performance Optimization

### Automatic Status Filtering

To align with standard application behavior, **nac** automatically filters records if a `status` column exists. By default, it will only return **active** records, reducing boilerplate for soft-state management.

### Ownership & Permissions

While the implementing app handles the authentication layer, **nac** provides a standardized way to enforce record ownership and granular access.

If your middleware populates `event.context.nac` with `resourcePermissions`, **nac** automatically injects the necessary SQL filters.

**Example: Restricting users to their own records**
If the permissions array includes `'list_own'`, **nac** appends a filter where `ownerCol === userId`.

```typescript
// Example: Setting context in your Auth Middleware
event.context.nac = {
  userId: user.id,
  resourcePermissions: user.permissions[model], // e.g., ['list_own', 'list']
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
  // if (table !== currentTable.value) return

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
---

## ⚠️ Limitations
**Database Support:** Currently optimized for SQLite/libSQL only.

---
