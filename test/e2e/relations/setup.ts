import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { resolve } from 'node:path'
import { beforeAll } from 'vitest'

await setup({
  rootDir: resolve(import.meta.dirname, '../../fixtures/relations'),
  server: true,
  browser: false,
})

// Seeds a small, real relational graph — one customer, two products, one
// order linking them through order_items — so the tests query real rows
// through the actual relation graph, not mocks.
//
// Idempotent: none of the GET handlers read query-string filters as a
// primary key lookup, so we fetch the full list and filter client-side by
// a unique business key before deciding whether to insert.
//
// Note: only the list (GET) fetches below are wrapped in {data, meta} —
// the POST create calls still return a single record directly, unwrapped.
beforeAll(async () => {
  const { data: customers } = await $fetch<{ data: Record<string, unknown>[] }>('/api/_nac/customers')
  let customer = customers.find(c => c.email === 'relations-e2e@clifland.com')
  if (!customer) {
    customer = await $fetch('/api/_nac/customers', {
      method: 'POST',
      body: { name: 'Relations E2E Customer', email: 'relations-e2e@clifland.com' },
    })
  }

  const { data: products } = await $fetch<{ data: Record<string, unknown>[] }>('/api/_nac/products')
  let productA = products.find(p => p.sku === 'REL-E2E-001')
  if (!productA) {
    productA = await $fetch('/api/_nac/products', {
      method: 'POST',
      body: { name: 'Relations E2E Widget', sku: 'REL-E2E-001', price: 10, stock: 100 },
    })
  }
  let productB = products.find(p => p.sku === 'REL-E2E-002')
  if (!productB) {
    productB = await $fetch('/api/_nac/products', {
      method: 'POST',
      body: { name: 'Relations E2E Gadget', sku: 'REL-E2E-002', price: 20, stock: 50 },
    })
  }

  const { data: orders } = await $fetch<{ data: Record<string, unknown>[] }>('/api/_nac/orders')
  let order = orders.find(o => o.num === 'REL-E2E-ORDER-001')
  if (!order) {
    order = await $fetch('/api/_nac/orders', {
      method: 'POST',
      body: { num: 'REL-E2E-ORDER-001', customer_id: customer.id, status: 'pending' },
    })

    // order_items has no unique business key of its own — only created
    // the one time we also create the order, so it can't duplicate on rerun.
    await $fetch('/api/_nac/order_items', {
      method: 'POST',
      body: { order_id: order.id, product_id: productA.id, quantity: 2, price: 10 },
    })
    await $fetch('/api/_nac/order_items', {
      method: 'POST',
      body: { order_id: order.id, product_id: productB.id, quantity: 1, price: 20 },
    })
  }
})
