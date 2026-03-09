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
  publishedAt: integer({ mode: 'timestamp' }), // Should test date coercion
  categoryId: integer('category_id').references(() => categories.id), // Should test relations
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),
  createdBy: integer('created_by'), // Add this
  updatedBy: integer('updated_by'), // Add this
})
