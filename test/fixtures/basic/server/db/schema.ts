import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  bio: text('bio'),
})

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(), // Should map to labelField
  description: text('description'), // Should map to textarea
})

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content'), // Should map to textarea
  status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft'), // Should map to enum
  authorEmail: text('author_email'), // Should map to email type
  publishedAt: text('published_at'), // Should test date coercion
  categoryId: integer('category_id').references(() => categories.id), // Should test relations
  createdAt: text('created_at').notNull(), // System field (hidden in form)
  updatedAt: text('updated_at'), // System field (hidden in form)
})

// System-level tables to test NAC_SYSTEM_TABLES exclusion
export const _hub_migrations = sqliteTable('_hub_migrations', {
  id: integer('id').primaryKey(),
  name: text('name'),
})
