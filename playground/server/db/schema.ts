import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  status: text('status', { enum: ['active', 'inactive'] }).default('active').notNull(),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  avatar: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
