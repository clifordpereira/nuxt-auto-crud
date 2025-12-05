import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatar: text('avatar'),
  status: text('status').notNull(), // 'subscribed' | 'unsubscribed' | 'bounced'
  location: text('location'),
})

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: real('price').notNull(),
  status: text('status').notNull(), // 'active' | 'archived'
  inventory: integer('inventory').notNull().default(0),
  image: text('image'),
})

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  total: real('total').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'completed' | 'cancelled'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}))

export const productsRelations = relations(products, ({ many }) => ({
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
}))
