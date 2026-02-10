import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { systemFields, auditRelations } from './utils'
import { categories } from './common'
import { users } from './users'
import { relations } from 'drizzle-orm'

/**
 * Posts
 * 
 * Posts are used to store blog posts/ articles/ pages/ etc.
 */
export const posts = sqliteTable('posts', {
  ...systemFields,
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content'),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  categoryId: integer('category_id').references(() => categories.id),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  status: text('status', { enum: ['draft', 'active', 'archived'] }).default('draft'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
})
export const postsRelations = relations(posts, (helpers) => ({
  ...auditRelations(helpers, posts, users),
}))
