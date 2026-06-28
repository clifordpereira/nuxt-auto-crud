import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  status: text('status', { enum: ['active', 'inactive'] }).default('active').notNull(),
  name: text().notNull(),
  email: text().notNull().unique(),
  avatar: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sku: text('sku').notNull(),
  price: numeric('price', { mode: 'number' }).notNull(),
  stock: integer('stock').notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
