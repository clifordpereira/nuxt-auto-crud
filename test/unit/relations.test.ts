import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest'
import { db, nacGetTableQueryConfig } from '../mocks/db'

// ─── fixtures ────────────────────────────────────────────────────────────────
import * as schema from '#nac/schema'
import { relations, nacTableQueryConfig } from '#nac/relations'

// ─── helpers ─────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks()

  const q = db.query as Record<string, Record<string, MockInstance>>
  q.orders?.findMany?.mockReset()
  q.orders?.findFirst?.mockReset()
  q.orderitems?.findMany?.mockReset()
  q.orderitems?.findFirst?.mockReset()
  q.customers?.findMany?.mockReset()
  q.customers?.findFirst?.mockReset()   // ← was missing
  q.products?.findMany?.mockReset()
  q.products?.findFirst?.mockReset()   // ← was missing

  nacGetTableQueryConfig.mockImplementation((tableName?: string) => {
    if (!tableName) return {}
    const config = (nacTableQueryConfig ?? {}) as Record<string, unknown>
    return (config[tableName] ?? {}) as Record<string, unknown>
  })
})

// ─── schema structure ─────────────────────────────────────────────────────────
describe('schema tables exist', () => {
  it('exports all four tables', () => {
    expect(schema.products).toBeDefined()
    expect(schema.customers).toBeDefined()
    expect(schema.orders).toBeDefined()
    expect(schema.orderitems).toBeDefined()
  })

  it('products has expected columns', () => {
    const cols = Object.keys(schema.products || {})
    expect(cols).toContain('id')
    expect(cols).toContain('name')
    expect(cols).toContain('sku')
    expect(cols).toContain('price')
    expect(cols).toContain('stock')
  })

  it('orders.customer_id references customers.id', () => {
    const col = (schema.orders as any)?.customer_id
    expect(col).toBeDefined()
    expect(col.name ?? col.columnName).toBe('customer_id')
  })

  it('orderitems has FK columns for order_id and product_id', () => {
    expect((schema.orderitems as any)?.order_id).toBeDefined()
    expect((schema.orderitems as any)?.product_id).toBeDefined()
  })
})

// ─── relations structure ──────────────────────────────────────────────────────
describe('relations are defined', () => {
  it('relations object is truthy', () => {
    expect(relations).toBeDefined()
    expect(typeof relations).toBe('object')
  })

  it('has relation config for all four tables', () => {
    const tables = Object.keys((relations ?? {}) as unknown as Record<string, unknown>)
    expect(tables).toContain('customers')
    expect(tables).toContain('products')
    expect(tables).toContain('orders')
    expect(tables).toContain('orderitems')
  })
})

// ─── nacTableQueryConfig via nacGetTableQueryConfig ──────────────────────────
describe('nacTableQueryConfig extraction via nacGetTableQueryConfig', () => {
  describe('orders config', () => {
    let cfg: Record<string, any>

    beforeEach(() => {
      cfg = nacGetTableQueryConfig('orders') as Record<string, any>
    })

    it('orders by id desc', () => {
      expect(cfg.orderBy).toEqual({ id: 'desc' })
    })

    it('includes customer with name + email columns only', () => {
      expect(cfg.with?.customer).toEqual({
        columns: { name: true, email: true },
      })
    })

    it('includes orderitems with nested product columns', () => {
      expect(cfg.with?.orderitems).toMatchObject({
        with: {
          product: { columns: { name: true, price: true } },
        },
      })
    })

    it('does NOT expose raw customer_id on orders', () => {
      expect(cfg.columns).toBeUndefined()
    })
  })

  describe('orderitems config', () => {
    let cfg: Record<string, any>

    beforeEach(() => {
      cfg = nacGetTableQueryConfig('orderitems') as Record<string, any>
    })

    it('orders by id asc', () => {
      expect(cfg.orderBy).toEqual({ id: 'asc' })
    })

    it('hides order_id and product_id FK columns', () => {
      expect(cfg.columns).toEqual({
        order_id: false,
        product_id: false,
      })
    })

    it('includes nested product with only name', () => {
      expect(cfg.with?.product).toEqual({ columns: { name: true } })
    })

    it('includes nested order with only status', () => {
      expect(cfg.with?.order).toEqual({ columns: { status: true } })
    })
  })
})

// ─── db.query mock integration ────────────────────────────────────────────────
describe('db.query mock — orders', () => {
  it('findMany returns mocked orders with relations shape', async () => {
    const mockOrders = [
      {
        id: 1,
        customer_id: 10,
        total_amount: 99.99,
        status: 'pending',
        customer: { name: 'Alice', email: 'alice@example.com' },
        orderitems: [
          { id: 1, quantity: 2, price: 49.99, product: { name: 'Widget', price: 49.99 } },
        ],
      },
    ]
    const q = db.query as Record<string, Record<string, any>>
    q.orders?.findMany.mockResolvedValueOnce(mockOrders)

    const cfg = nacGetTableQueryConfig('orders')
    const result = await db.query.orders.findMany(cfg)

    expect(q.orders?.findMany).toHaveBeenCalledOnce()
    expect(q.orders?.findMany).toHaveBeenCalledWith(cfg)
    expect(result).toHaveLength(1)
    expect(result[0].customer).toMatchObject({ name: 'Alice', email: 'alice@example.com' })
    expect(result[0].orderitems[0].product).toMatchObject({ name: 'Widget' })
  })

  it('findFirst returns a single order by id', async () => {
    const mockOrder = {
      id: 2,
      total_amount: 150,
      status: 'shipped',
      customer: { name: 'Bob', email: 'bob@example.com' },
      orderitems: [],
    }
    const q = db.query as Record<string, Record<string, any>>
    q.orders?.findFirst.mockResolvedValueOnce(mockOrder)

    const result = await db.query.orders.findFirst({ where: { id: 2 } })

    expect(q.orders?.findFirst).toHaveBeenCalledOnce()
    expect(result?.status).toBe('shipped')
    expect(result?.customer.name).toBe('Bob')
  })

  it('findMany returns empty array when no orders', async () => {
    const q = db.query as Record<string, Record<string, any>>
    q.orders?.findMany.mockResolvedValueOnce([])
    const result = await db.query.orders.findMany()
    expect(result).toEqual([])
  })
})

describe('db.query mock — orderitems', () => {
  it('findMany returns items with hidden FK columns and nested relations', async () => {
    const mockItems = [
      {
        id: 1,
        quantity: 3,
        price: 29.99,
        product: { name: 'Gadget' },
        order: { status: 'processing' },
      },
    ]
    const q = db.query as Record<string, Record<string, any>>
    q.orderitems?.findMany.mockResolvedValueOnce(mockItems)

    const cfg = nacGetTableQueryConfig('orderitems')
    const result = await db.query.orderitems?.findMany(cfg)

    expect(q.orderitems?.findMany).toHaveBeenCalledWith(cfg)
    expect(result[0]).not.toHaveProperty('order_id')
    expect(result[0]).not.toHaveProperty('product_id')
    expect(result[0].product).toEqual({ name: 'Gadget' })
    expect(result[0].order).toEqual({ status: 'processing' })
  })
})

describe('db.query mock — customers with orders', () => {
  it('findFirst returns customer with nested orders array', async () => {
    const mockCustomer = {
      id: 10,
      name: 'Alice',
      email: 'alice@example.com',
      phone: null,
      orders: [
        { id: 1, status: 'delivered', total_amount: 99.99 },
        { id: 2, status: 'pending', total_amount: 50 },
      ],
    }
    const q = db.query as Record<string, Record<string, any>>
    q.customers?.findFirst.mockResolvedValueOnce(mockCustomer)

    const result = await db.query.customers.findFirst({
      where: { id: 10 },
      with: { orders: true },
    })

    expect(result?.orders).toHaveLength(2)
    expect(result?.orders[0].status).toBe('delivered')
  })
})

describe('db.query mock — products with many-through-orderitems', () => {
  it('findMany returns products with nested orderitems and orders', async () => {
    const mockProducts = [
      {
        id: 1,
        name: 'Widget',
        sku: 'WGT-001',
        price: 49.99,
        stock: 100,
        orderitems: [
          {
            id: 1,
            quantity: 2,
            price: 49.99,
            order: { id: 1, status: 'shipped' },
          },
        ],
      },
    ]
    const q = db.query as Record<string, Record<string, any>>
    q.products?.findMany.mockResolvedValueOnce(mockProducts)

    const result = await db.query.products.findMany({
      with: { orderitems: { with: { order: true } } },
    })

    expect(result[0].orderitems[0].order.status).toBe('shipped')
  })
})

// ─── nacGetTableQueryConfig mock ──────────────────────────────────────────────
describe('nacGetTableQueryConfig mock', () => {
  it('is callable and returns an object by default', () => {
    expect(nacGetTableQueryConfig('orders')).toBeDefined()
  })

  it('can be overridden per test', () => {
    nacGetTableQueryConfig.mockReturnValueOnce(nacTableQueryConfig?.orders ?? { orderBy: { id: 'desc' } })
    const cfg = nacGetTableQueryConfig('orders')
    expect(cfg).toHaveProperty('orderBy', { id: 'desc' })
  })
})