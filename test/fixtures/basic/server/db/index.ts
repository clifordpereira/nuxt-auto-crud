import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'
import { relations } from './relations'

const url = process.env.DATABASE_URL! || 'file:./.data/db/sqlite.db'

const client = createClient({ url })
const db = drizzle({ client, schema, relations })

export default db
