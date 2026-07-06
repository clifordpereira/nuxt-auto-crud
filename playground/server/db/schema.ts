import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core'

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sku: text('sku').notNull(),
  price: numeric('price', { mode: 'number' }).notNull(),
  stock: integer('stock').notNull(),
  created_at: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  created_at: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customer_id: integer('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  total_amount: numeric('total_amount', { mode: 'number' }).notNull(),
  status: text('status', { enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] })
    .notNull()
    .default('pending'),
  created_at: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const orderitems = sqliteTable('orderitems', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  order_id: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  product_id: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { mode: 'number' }).notNull(),
})

export type Product = typeof products.$inferSelect
export type Customer = typeof customers.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderitems.$inferSelect
