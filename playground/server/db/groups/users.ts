import { text, integer, snakeCase } from 'drizzle-orm/sqlite-core'
import { timestamps } from '../utils'
import { roles } from './authz'

export const users = snakeCase.table('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roleId: integer('role_id').references(() => roles.id).default(1),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text(),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  ...timestamps,
})

export type User = typeof users.$inferSelect
