import { defineRelations, type DBQueryConfig } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, r => ({
  customers: {
    orders: r.many.orders({
      from: r.customers.id,
      to: r.orders.customer_id,
    }),
  },
  products: {
    orders: r.many.orders({
      from: r.products.id.through(r.order_items.product_id),
      to: r.orders.id.through(r.order_items.order_id),
    }),
    order_items: r.many.order_items({
      from: r.products.id,
      to: r.order_items.product_id,
    }),
  },
  orders: {
    customer: r.one.customers({
      from: r.orders.customer_id,
      to: r.customers.id,
    }),
    products: r.many.products({
      from: r.orders.id.through(r.order_items.order_id),
      to: r.products.id.through(r.order_items.product_id),
    }),
    order_items: r.many.order_items({
      from: r.orders.id,
      to: r.order_items.order_id,
    }),
  },
  order_items: {
    order: r.one.orders({
      from: r.order_items.order_id,
      to: r.orders.id,
    }),
    product: r.one.products({
      from: r.order_items.product_id,
      to: r.products.id,
    }),
  },
}))

export const nacTableQueryConfig: Record<string, DBQueryConfig> = {
  products: {
    with: {
      orders: true,
    },
  },
  orders: {
    orderBy: { id: 'desc' },
    with: {
      customer: { columns: { name: true, email: true } },
      order_items: {
        with: {
          product: { columns: { name: true } },
        },
      },
    },
  },
  order_items: {
    orderBy: { id: 'asc' },
    columns: {
      order_id: false,
      product_id: false,
    },
    with: {
      product: { columns: { name: true } },
      order: { columns: { num: true, status: true } },
    },
  },
}
