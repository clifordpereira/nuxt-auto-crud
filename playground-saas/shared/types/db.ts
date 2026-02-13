import type { users } from '@nuxthub/db/schema'

// Select types (for reading data)
export type User = typeof users.$inferSelect

// Insert types (for creating data)
export type NewUser = typeof users.$inferInsert
