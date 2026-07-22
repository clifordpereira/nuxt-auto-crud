import { integer, text, snakeCase } from 'drizzle-orm/sqlite-core'
import { roles } from './roles-n-permissions'
import { auditFields } from '../utils'

export const users = snakeCase.table('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  roleId: integer().references(() => roles.id).default(1),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text(),
  avatar: text(),
  ...auditFields,
})

export type User = typeof users.$inferSelect
