# Custom Setup (Non-NuxtHub)

While `nuxt-auto-crud` works seamlessly with [NuxtHub](https://hub.nuxt.com/), it is not a hard dependency. The module is designed to work with **Drizzle ORM** and any **SQLite** database.

If you prefer to use a different SQLite provider (like `better-sqlite3`, `libsql`, or `bun:sqlite`), you just need to ensure your `useDrizzle` composable returns a valid Drizzle SQLite instance.

## 1. Install Dependencies

Instead of `@nuxthub/core`, install the driver for your database.

### For Local / Node.js (better-sqlite3)

```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

### For Turso / LibSQL

```bash
npm install @libsql/client
```

## 2. Configure `useDrizzle`

The module looks for a `useDrizzle` export in your `drizzlePath` (default: `server/utils/drizzle.ts`). You need to configure this file to export your database instance.

### Option A: Using `better-sqlite3`

```typescript
// server/utils/drizzle.ts
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../database/schema'

// Initialize the database
const sqlite = new Database('sqlite.db')
export const db = drizzle(sqlite, { schema })

// Export the useDrizzle composable expected by nuxt-auto-crud
export function useDrizzle() {
  return db
}

// Export schema tables for use in your app
export const tables = schema
export { sql, eq, and, or } from 'drizzle-orm'
```

### Option B: Using `libsql` (Turso)

```typescript
// server/utils/drizzle.ts
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '../database/schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })

export function useDrizzle() {
  return db
}

export const tables = schema
export { sql, eq, and, or } from 'drizzle-orm'
```

## 3. Configuration

Ensure your `nuxt.config.ts` points to this file (this is the default, so you might not need to change anything):

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-auto-crud'],

  autoCrud: {
    drizzlePath: 'server/utils/drizzle', // Default
    schemaPath: 'server/database/schema', // Default
  },
})
```

That's it! The module will now use your custom Drizzle setup to perform CRUD operations.
