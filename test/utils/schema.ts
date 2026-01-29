// test/utils/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name'), // To test label priority over email
  email: text('email').notNull(),
  bio: text('bio'),
  role: text('role', { enum: ['admin', 'user'] }),
  lastLogin: integer('last_login', { mode: 'timestamp' }),
  createdBy: integer('created_by'), // To test auto-link heuristic
  password: text('password'),
})

export const logs = sqliteTable('logs', {
  id: integer('id').primaryKey(),
  message: text('message'),
})


export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  authorId: integer('author_id').references(() => users.id),
})

export const mockSchema = { users, logs, posts }