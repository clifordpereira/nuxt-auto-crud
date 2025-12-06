import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { systemFields, statusField } from './utils'

export const users = sqliteTable('users', {
  ...systemFields,
  ...statusField,
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  role: text('role').default('user'),
})
