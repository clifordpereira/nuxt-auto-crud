// @ts-expect-error - virtual module
import { db, schema } from 'hub:db'

export const tables = schema

export function useDrizzle() {
  return db
}
