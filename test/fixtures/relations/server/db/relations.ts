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
      from: r.products.id.through(r.orderitems.product_id),
      to: r.orders.id.through(r.orderitems.order_id),
    }),
    orderitems: r.many.orderitems({
      from: r.products.id,
      to: r.orderitems.product_id,
    }),
  },
  orders: {
    customer: r.one.customers({
      from: r.orders.customer_id,
      to: r.customers.id,
    }),
    products: r.many.products({
      from: r.orders.id.through(r.orderitems.order_id),
      to: r.products.id.through(r.orderitems.product_id),
    }),
    orderitems: r.many.orderitems({
      from: r.orders.id,
      to: r.orderitems.order_id,
    }),
  },
  orderitems: {
    order: r.one.orders({
      from: r.orderitems.order_id,
      to: r.orders.id,
    }),
    product: r.one.products({
      from: r.orderitems.product_id,
      to: r.products.id,
    }),
  },
}))

export const nacTableQueryConfig: Record<string, DBQueryConfig> = {
  orders: {
    orderBy: { id: 'desc' },
    with: {
      customer: { columns: { name: true, email: true } },
      orderitems: {
        with: {
          product: { columns: { name: true } },
        },
      },
    },
  },
  orderitems: {
    orderBy: { id: 'asc' },
    with: {
      product: { columns: { name: true } },
      order: { columns: { num: true, status: true } },
    },
  },
}
