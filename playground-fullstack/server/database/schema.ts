// Sample database schema for nuxt-auto-crud playground
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

/**
 * Users table
 * Example: /api/users
 */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatar: text('avatar'),
  bio: text('bio'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})

/**
 * Posts table
 * Example: /api/posts
 */
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  published: integer('published', { mode: 'boolean' }).default(false),
  authorId: integer('author_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})

/**
 * Comments table
 * Example: /api/comments
 */
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  postId: integer('post_id').references(() => posts.id),
  userId: integer('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})
