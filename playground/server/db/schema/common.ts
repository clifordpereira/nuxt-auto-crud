import { sqliteTable, text, index, integer } from 'drizzle-orm/sqlite-core'
import { systemFields, baseFields } from './utils'
import { users } from './users'

export const categories = sqliteTable('categories', {
  ...systemFields,

  ...baseFields,
  slug: text('slug').notNull().unique(),
  type: text('type', { enum: ['post', 'product', 'service'] }).notNull().default('post'),
})

export const comments = sqliteTable('comments', {
  ...systemFields,
  content: text('content').notNull(),

  // Polymorphic Fields (Generic for any resource: 'post', 'product', 'service', etc.)
  resourceType: text('resource_type').notNull(),
  resourceId: integer('resource_id').notNull(),

  userId: integer('user_id').references(() => users.id), // Optional: for logged-in users
  authorName: text('author_name'), // For guest comments
  authorEmail: text('author_email'), // For guest comments

  rating: integer('rating'), // Optional: 1-5 stars. If present, this acts as a "Review"
  isApproved: integer('is_approved', { mode: 'boolean' }).default(false),
}, t => ({
  resourceIdx: index('resource_idx').on(t.resourceType, t.resourceId),
}))
