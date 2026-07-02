// @ts-ignore — Virtual aliases generated at build-time
import * as schema from '#nac/schema'
// @ts-ignore — Safely falls back to empty-stub on environments without relations
import { relations } from '#nac/relations'

/**
 * Factory helper to initialize the correct Drizzle ORM instance
 * based on the user's private module options.
 */
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

const url = process.env.DATABASE_URL! || 'file:./.data/db/sqlite.db'

const client = createClient({ url })
export const nacDb = drizzle({ client, schema, relations })

