import { mysqlTable, bigint, varchar, decimal, int, timestamp } from 'drizzle-orm/mysql-core'

export const products = mysqlTable('products', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: int('stock').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const customers = mysqlTable('customers', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const orders = mysqlTable('orders', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  customer_id: bigint('customer_id', { mode: 'number' })
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const orderitems = mysqlTable('orderitems', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  order_id: bigint('order_id', { mode: 'number' })
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  product_id: bigint('product_id', { mode: 'number' })
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  quantity: int('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
})