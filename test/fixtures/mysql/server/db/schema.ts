import { mysqlTable, serial, varchar, text, mysqlEnum, timestamp, bigint } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: serial().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(), // Unique requires varchar length
  password: text().notNull(),
  avatar: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
})

export const categories = mysqlTable('categories', {
  id: serial().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text(),
})

export const posts = mysqlTable('posts', {
  id: serial().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text(),
  status: mysqlEnum('status', ['draft', 'published', 'archived']).default('draft'),
  authorEmail: varchar('author_email', { length: 255 }),
  publishedAt: timestamp(),
  categoryId: bigint('category_id', { mode: 'number', unsigned: true }).references(() => categories.id), // Serial is unsigned bigint
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().onUpdateNow(),
  createdBy: bigint('created_by', { mode: 'number', unsigned: true }),
  updatedBy: bigint('updated_by', { mode: 'number', unsigned: true }),
})
