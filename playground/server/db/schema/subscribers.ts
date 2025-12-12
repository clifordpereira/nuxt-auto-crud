import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { systemFields } from './utils'

export const subscribers = sqliteTable('subscribers', {
  ...systemFields,
  email: text('email').notNull().unique(),
})
