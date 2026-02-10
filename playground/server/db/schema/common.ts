import { sqliteTable, text, index, integer } from 'drizzle-orm/sqlite-core'
import { systemFields, baseFields, auditRelations } from './utils'
import { users } from './users'
import { relations } from 'drizzle-orm'

/**
 * Categories
 * 
 * Categories are used to organize content.
 */
export const categories = sqliteTable('categories', {
  ...systemFields,

  ...baseFields,
  slug: text('slug').notNull().unique(),
  type: text('type', { enum: ['post', 'product', 'service'] }).notNull().default('post'),
})
export const categoriesRelations = relations(categories, (helpers) => ({
  ...auditRelations(helpers, categories, users),
}))

/**
 * Polymorphic Comments/Reviews
 * 
 * This table is designed to be generic. It can be used for:
 * - Comments on posts
 * - Reviews on products
 * - Feedback on services
 * 
 * The `resourceType` and `resourceId` columns link the comment to the specific resource.
 */
export const comments = sqliteTable('comments', {
  ...systemFields,
  content: text('content').notNull(),

  // Polymorphic Fields (Generic for any resource: 'post', 'product', 'service', etc.)
  resourceType: text('resource_type').notNull(),
  resourceId: integer('resource_id').notNull(),

  authorId: integer('author_id').references(() => users.id),
  authorName: text('author_name'), // For guest comments
  authorEmail: text('author_email'), // For guest comments

  rating: integer('rating'), // Optional: 1-5 stars. If present, this acts as a "Review"
  isApproved: integer('is_approved', { mode: 'boolean' }).default(false),
}, t => ({
  resourceIdx: index('resource_idx').on(t.resourceType, t.resourceId),
}))
export const commentsRelations = relations(comments, (helpers) => ({
  ...auditRelations(helpers, comments, users),
  author: helpers.one(users, {
    fields: [comments.authorId],
    references: [users.id],
    relationName: 'comment_author',
  }),
}))
