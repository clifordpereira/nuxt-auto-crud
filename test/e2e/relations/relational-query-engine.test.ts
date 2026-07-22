import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

describe('NAC: Relational Query Engine (relations fixture — real DB, no auth)', () => {
  it('GET /orders includes nested customer, order_items, and each order_item\'s nested product', async () => {
    const orders = await $fetch<Record<string, unknown>[]>('/api/_nac/orders')
    const order = orders.find(o => o.num === 'REL-E2E-ORDER-001')
    expect(order).toBeDefined()

    expect(order!.customer).toMatchObject({ name: 'Relations E2E Customer', email: 'relations-e2e@clifland.com' })

    const items = order!.order_items as Record<string, unknown>[]
    expect(items).toHaveLength(2)
    expect(items.map(i => i.product)).toEqual(
      expect.arrayContaining([
        { name: 'Relations E2E Widget' },
        { name: 'Relations E2E Gadget' },
      ]),
    )
  })

  it('nested product columns are restricted to "name" only, per nacTableQueryConfig', async () => {
    const orders = await $fetch<Record<string, unknown>[]>('/api/_nac/orders')
    const order = orders.find(o => o.num === 'REL-E2E-ORDER-001')
    const items = order!.order_items as Record<string, unknown>[]

    for (const item of items) {
      expect(item.product).not.toHaveProperty('price')
      expect(item.product).not.toHaveProperty('sku')
    }
  })

  it('GET /products includes related orders via the many-to-many .through(order_items) relation', async () => {
    const products = await $fetch<Record<string, unknown>[]>('/api/_nac/products')
    const productA = products.find(p => p.sku === 'REL-E2E-001')
    expect(productA).toBeDefined()

    const relatedOrders = productA!.orders as Record<string, unknown>[]
    expect(relatedOrders.some(o => o.num === 'REL-E2E-ORDER-001')).toBe(true)
  })

  it('GET /order_items is ordered ascending by id, per its configured orderBy', async () => {
    const items = await $fetch<Record<string, unknown>[]>('/api/_nac/order_items')
    const ids = items.map(i => Number(i.id))
    const sortedAscending = [...ids].sort((a, b) => a - b)
    expect(ids).toEqual(sortedAscending)
  })

  it('nested order on an order_item includes num and status only, per nacTableQueryConfig', async () => {
    const items = await $fetch<Record<string, unknown>[]>('/api/_nac/order_items')
    const item = items.find(i => (i.order as Record<string, unknown> | undefined)?.num === 'REL-E2E-ORDER-001')
    expect(item).toBeDefined()
    expect(item!.order).toEqual({ num: 'REL-E2E-ORDER-001', status: 'pending' })
  })
})