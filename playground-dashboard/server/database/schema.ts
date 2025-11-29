import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  avatar: text('avatar'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatar: text('avatar'),
  status: text('status').notNull(), // 'subscribed' | 'unsubscribed' | 'bounced'
  location: text('location')
})

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: real('price').notNull(),
  status: text('status').notNull(), // 'active' | 'archived'
  inventory: integer('inventory').notNull().default(0),
  image: text('image')
})

export const sales = sqliteTable('sales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull(), // 'paid' | 'failed' | 'refunded'
  email: text('email').notNull(),
  amount: real('amount').notNull()
})

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  unread: integer('unread', { mode: 'boolean' }).default(true),
  senderId: integer('sender_id').references(() => users.id),
  body: text('body').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull()
})
