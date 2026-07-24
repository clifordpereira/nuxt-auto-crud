import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'
import { nacGetRows } from '../../../src/runtime/server/utils/queries'
import type { NacTableWithId } from '../../../src/runtime/server/types'
import { products } from '#nac/schema'
import { nacGetTableQueryConfig, getNacDb, isMysql, hasActiveRelations } from '#nac/db'
import type { MockNacDb } from '../../mocks/db'

const BASE_RUNTIME_CONFIG = {
  hub: { db: 'sqlite' },
  autoCrud: { statusFiltering: false, auth: { authorization: false, ownerKey: 'createdBy' }, apiHiddenFields: [] },
  public: { autoCrud: { formHiddenFields: [], formReadOnlyFields: [], nacEndpointPrefix: '/api/_nac', apiBase: '/api/_nac' } },
}

const mockConfig = (overrides: Record<string, unknown> = {}) =>
  vi.mocked(useRuntimeConfig).mockReturnValue({ ...BASE_RUNTIME_CONFIG, ...overrides } as unknown as ReturnType<typeof useRuntimeConfig>)

vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm')
  return { ...actual, getColumns: vi.fn(table => table), or: actual.or, and: actual.and, eq: actual.eq, desc: actual.desc }
})

describe('nacGetRows() — pagination (relations fixture, relational branch)', () => {
  let db: MockNacDb

  beforeEach(async () => {
    vi.clearAllMocks()
    mockConfig()
    db = await getNacDb() as unknown as MockNacDb
    db._ = { relations: { products: {} } }
    vi.mocked(isMysql).mockReturnValue(false)
    vi.mocked(hasActiveRelations).mockReturnValue(true)
    vi.mocked(nacGetTableQueryConfig).mockReturnValue({})
  })

  it('passes resolved limit/offset into findMany, alongside the default orderBy', async () => {
    vi.mocked(db.query.products.findMany).mockResolvedValue([])

    await nacGetRows(products as unknown as NacTableWithId, {}, { limit: '3', page: '2' })

    expect(db.query.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 4, offset: 3, orderBy: { id: 'desc' } }),
    )
  })

  it('defaults to limit 50, offset 0 when no query params are given', async () => {
    vi.mocked(db.query.products.findMany).mockResolvedValue([])

    await nacGetRows(products as unknown as NacTableWithId, {}, {})

    expect(db.query.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 51, offset: 0 }),
    )
  })
})
