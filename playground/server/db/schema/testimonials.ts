import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { systemFields } from './utils'

export const testimonials = sqliteTable('testimonials', {
  ...systemFields,
  status: text('status', { enum: ['active', 'inactive'] }).default('inactive'),
  name: text('name').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  avatar: text('avatar'),
  company: text('company'),
})
