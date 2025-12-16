import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { systemFields } from './utils'
import { users } from './users'
import { relations } from 'drizzle-orm'

export const testimonials = sqliteTable('testimonials', {
  ...systemFields,
  status: text('status', { enum: ['active', 'inactive'] }).default('inactive'),
  name: text('name').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  avatar: text('avatar'),
  company: text('company')
})

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  creator: one(users, {
    fields: [testimonials.createdBy],
    references: [users.id],
    relationName: 'creator'
  }),
  updater: one(users, {
    fields: [testimonials.updatedBy],
    references: [users.id],
    relationName: 'updater'
  })
}))
