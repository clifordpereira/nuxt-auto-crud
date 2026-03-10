# nuxt-auto-crud (nac 2.x beta)

**Zero-Codegen Dynamic RESTful CRUD APIs** derived directly from schemas. It eliminates the need to manually write or generate boilerplate for CRUD operations.

---

## 🚀 Core Features

* **Zero-Codegen Dynamic RESTful CRUD APIs**: nuxt-auto-crud leverages Drizzle ORM, Zod, Nuxt, and Nitro to eliminate the need for manual CRUD coding.
* **Single Source of Truth (SSOT)**: Your Drizzle schemas (`schema/db/schema`) define the entire API structure and validation.
* **Constant Bundle Size**: Since no code is generated, the bundle size remains virtually identical whether you have one table or one hundred (scaling only with your schema definitions).
---

## Supported Databases
* **SQLite (libSQL)**
* **MySQL**

---

## Installation Guide

### Option A: Starter Template
#### SQLite
```bash
npx nuxi init -t gh:clifordpereira/nac-starter my-app
cd my-app
```

#### MySQL
Visit [nac-starter-mysql](https://github.com/clifordpereira/nac-starter-mysql) for instructions.

### Option B: Manual Installation

```bash
bun create nuxt@latest my-app
cd my-app
npx nuxi module add hub
bun add drizzle-orm@beta @libsql/client nuxt-auto-crud
bun add -D drizzle-kit@beta

```
> Mysql users may replace `@libsql/client` with `mysql2`

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
    // db: 'mysql'
  }
})

```

#### Schema Definition (SQLite)

Define your schema in `server/db/schema.ts`:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  avatar: text().notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

```

#### Schema Definition (MySQL)

Define your schema in `server/db/schema.ts`:

```typescript
import { mysqlTable, text, serial, timestamp } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  avatar: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
})

```

#### Using Docker for MySQL
If you are using mysql, make sure that you have set hub.db to 'mysql' in nuxt.config.ts.

If you have docker installed, copy and paste [docker-compose.yml](https://github.com/clifordpereira/nac-starter-mysql/blob/main/docker-compose.yml) to your project root.

Then start mysql service:

```bash
docker compose up -d
# Stop service: docker compose down
# Purge data: docker compose down -v
```

### Generate Migrations and Start Dev Server
After installing (either option), run the following commands:

```bash
nuxt db generate
nuxt dev

```
> If you encounter `Error: Cannot find module 'typescript'`, install it using `bun add -D typescript`.

---

## 🌐 Data APIs (Dynamic RESTful CRUD)

> Note: All endpoints follow the pattern ${nacEndpointPrefix}/:model. By default, this is /api/_nac/:model.

| Method | Endpoint | Action |
| --- | --- | --- |
| **GET** | `/:model` | List records |
| **POST** | `/:model` | Create record with Zod validation |
| **GET** | `/:model/:id` | Fetch single record |
| **PATCH** | `/:model/:id` | Partial update with validation |
| **DELETE** | `/:model/:id` | Delete record |


**Example (`users` table):** 

| Action | HTTP Method | Endpoint | Example Result |
| --- | --- | --- | --- |
| **Fetch All** | `GET` | `/api/_nac/users` | List of all users |
| **Create** | `POST` | `/api/_nac/users` | New user record added |
| **Fetch One** | `GET` | `/api/_nac/users/1` | Details of user with `id: 1` |
| **Update** | `PATCH` | `/api/_nac/users/1` | Partial update to user `1` |
| **Delete** | `DELETE` | `/api/_nac/users/1` | User `1` removed from DB |

---

## 🛠 Introspection & Metadata APIs

Use these endpoints to build dynamic UI components (like menus and forms) or provide context to AI agents. These use the `_schemas` and `_meta` reserved paths.

### 1. Discovery Endpoints

* **List Resource Names**: `GET /api/_nac/_schemas`
* Returns an array of all available table names. Useful for generating dynamic navigation menus.
* **Resource Metadata**: `GET /api/_nac/_schemas/:resource`
* Returns field definitions, validation rules, and `isReadOnly` status for a specific table.
* **Example:** `GET /api/_nac/_schemas/users` returns the schema for the users table.

### 2. Agentic Discovery

* **Manifest**: `GET /api/_nac/_meta?format=md`
* Returns a token-efficient Markdown manifest for LLM context injection.
* **Security:** Requires `NUXT_AUTO_CRUD_AGENTIC_TOKEN` (min 16 characters) in your `.env`.

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

* **`apiHiddenFields`**: Globally hides sensitive columns from all API responses. Default: ['password', 'secret', 'token', 'resetToken', 'resetExpires', 'githubId', 'googleId'].
* **`formHiddenFields`**: Columns excluded from the frontend schema metadata to prevent user input. Defaults to apiHiddenFields plus system-managed fields like `id`, `uuid`, `createdAt`, `updatedAt`, `deletedAt`, `createdBy`, and `updatedBy`.
* **`formReadOnlyFields`**: Columns visible in the UI for context but protected from user modification (e.g., slug, status).
* **Response Scrubbing**: If a field is in `apiHiddenFields` or does not exist in the schema, it is silently stripped from the response even if listed in `publicResources`.

---

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
| `formHiddenFields` | `NAC_FORM_HIDDEN_FIELDS` | Arrays of keys to exclude from dynamic forms. |
| `formReadOnlyFields` | `NAC_FORM_READ_ONLY_FIELDS` | List of visible but non-editable fields (UI only). |
| `agenticToken` | `''` | Secret key used to secure the /_meta endpoint, preventing unauthorized AI agents from introspecting your schema. |
| `nacEndpointPrefix` | `'/api/_nac'` | The base path for NAC routes. Access via `useRuntimeConfig().public.autoCrud`. |
| `schemaPath` | `'server/db/schema'` | Location of your Drizzle schema files. |

### Example `nuxt.config.ts`

```typescript
autoCrud: {
  statusFiltering: false,
  realtime: false,
  auth: {
    authentication: false,
    authorization: false,
    ownerKey: 'createdBy', 
  },
  publicResources: {
    users: ['id', 'name', 'email'],
  },
  apiHiddenFields: ['password'], 
  formHiddenFields: ['createdAt'], // All fields should be camelCase
  formReadOnlyFields: ['slug', 'externalId'], // Locked for user input
  agenticToken: '', 
  nacEndpointPrefix: '/api/_nac',
  schemaPath: 'server/db/schema',
}

```

> **Note**: Modify `nacEndpointPrefix` or `schemaPath` only if the Nuxt/Nitro conventions change.
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

