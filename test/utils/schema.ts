import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name'), 
  email: text('email').notNull(),
  bio: text('bio'),
  role: text('role', { enum: ['admin', 'user'] }),
  lastLogin: integer('last_login', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }), // Added for PROTECTED_FIELDS test
  createdBy: integer('created_by'), 
  password: text('password'),
})

export const logs = sqliteTable('logs', {
  id: integer('id').primaryKey(),
  message: text('message'),
})

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  authorId: integer('author_id').references(() => users.id),
  status: text('status', { enum: ['draft', 'published'] })
})

export const mockSchema = { users, logs, posts }
