import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { systemFields } from './utils'
import { categories } from './common'

export const posts = sqliteTable('posts', {
  ...systemFields,
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content'),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  userId: integer('user_id').references(() => users.id),
  categoryId: integer('category_id').references(() => categories.id),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft'),
  publishedAt: integer('published_at', { mode: 'timestamp' })
})
