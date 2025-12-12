import { db, schema } from 'hub:db'

export const tables = schema

export function useDrizzle() {
  return db
}

export type User = typeof schema.users.$inferSelect
