import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { schema } from '@nuxthub/db'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roleId: integer('role_id').notNull().references(() => schema.roles.id),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().$onUpdate(() => new Date()),
})
