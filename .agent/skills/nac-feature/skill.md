# NAC Feature Skill

Procedure for adding new Drizzle schemas and exposing them via the Nuxt Auto CRUD (NAC) core.

## Overview
NAC uses runtime reflection to automatically discover Drizzle tables exported from the configured schema path.

## Procedure

### 1. Define Schema
Create a new schema file in the Concrete Class (App):
`server/db/schema/[entity].ts`

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const [entity] = sqliteTable('[entity]', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
```

### 2. Export Schema
Ensure the new table is exported from the main schema entry point (usually `server/db/schema/index.ts` if using multiple files):

```typescript
export * from './[entity]'
```

### 3. Verification
Verify the model is detected by the NAC core:
1. Ensure `autoCrud.schemaPath` in `nuxt.config.ts` points to your schema directory.
2. Call `http://localhost:3000/api/_meta?format=md` to see the new resource in the API manifest.

