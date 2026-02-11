import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { systemFields } from './utils'
import { users } from './users'

export const testimonials = sqliteTable('testimonials', {
  ...systemFields,
  status: text('status', { enum: ['active', 'inactive'] }).default('inactive'),
  name: text('name').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  avatar: text('avatar'),
  company: text('company'),
})

export const subscribers = sqliteTable('subscribers', {
  ...systemFields,
  email: text('email').notNull().unique(),
})

export const notifications = sqliteTable('notifications', {
  ...systemFields,
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  body: text('body'),
  category: text('category').$type<'system' | 'human'>(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  metadata: text('metadata', { mode: 'json' }), // For "Agentic Ready" links
});
