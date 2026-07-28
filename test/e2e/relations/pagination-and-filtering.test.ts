import { describe, it, expect, beforeAll } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

interface Product {
  id: number
  name: string
  sku: string
  stock: number
}

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    mode: 'offset' | 'simple' | 'cursor'
    perPage: number
    total?: number
    page?: number
    nextCursor?: string
    hasMore: boolean
  }
}

describe('NAC: Pagination + Filtering against the real relational query engine (relations fixture)', () => {
  let productA: Product
  let productB: Product

  beforeAll(async () => {
    const { data: products } = await $fetch<PaginatedResponse<Product>>('/api/_nac/products')
    const foundA = products.find(p => p.sku === 'REL-E2E-001')
    const foundB = products.find(p => p.sku === 'REL-E2E-002')
    if (!foundA || !foundB) throw new Error('Seed products not found — did test/e2e/relations/setup.ts run?')
    productA = foundA
    productB = foundB
  })

  it('an equality filter alone resolves correctly against the relational branch', async () => {
    // This exact combination — a filter reaching db.query[x].findMany() —
    // is what originally broke with "Unknown relational filter field:
    // decoder": the classic SQL filter builders build conditions against
    // the unaliased table object, which RQB's internal query aliasing
    // rejects. Exists specifically to catch a regression of that bug.
    const { data } = await $fetch<PaginatedResponse<Product>>(`/api/_nac/products?sku=${productA.sku}`)
    expect(data).toHaveLength(1)
    expect(data[0]!.sku).toBe(productA.sku)
  })

  it('cursor pagination alone resolves correctly against the relational branch', async () => {
    // Default ordering is id desc — cursoring from the higher id should
    // only return rows with a strictly lower id.
    const higherId = Math.max(productA.id, productB.id)
    const { data, meta } = await $fetch<PaginatedResponse<Product>>(`/api/_nac/products?cursor=${higherId}`)
    expect(meta.mode).toBe('cursor')
    expect(data.every(p => p.id < higherId)).toBe(true)
  })

  it('an equality filter combined with a cursor resolves correctly (the previously untested combination)', async () => {
    const beyondBothIds = Math.max(productA.id, productB.id) + 1
    const { data, meta } = await $fetch<PaginatedResponse<Product>>(
      `/api/_nac/products?cursor=${beyondBothIds}&sku=${productB.sku}`,
    )
    expect(meta.mode).toBe('cursor')
    expect(data).toHaveLength(1)
    expect(data[0]!.sku).toBe(productB.sku)
  })

  it('limit correctly caps results and sets hasMore on the relational branch', async () => {
    const { data, meta } = await $fetch<PaginatedResponse<Product>>('/api/_nac/products?limit=1')
    expect(data).toHaveLength(1)
    expect(meta.hasMore).toBe(true) // at least 2 seeded products exist
  })

  it('an equality filter on order_items (a table reached via relational config) resolves correctly', async () => {
    // productA's seeded order_item has quantity: 2, productB's has quantity: 1
    const { data } = await $fetch<PaginatedResponse<Record<string, unknown>>>('/api/_nac/order_items?quantity=2')
    expect(data.length).toBeGreaterThan(0)
    expect(data.every(item => item.quantity === 2)).toBe(true)
  })
})
