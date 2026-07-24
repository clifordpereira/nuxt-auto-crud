import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'
import { nacGetRows } from '../../../src/runtime/server/utils/queries'
import type { NacTableWithId } from '../../../src/runtime/server/types'
import { products } from '#nac/schema'
import { nacGetTableQueryConfig, getNacDb, isMysql, hasActiveRelations } from '#nac/db'
import type { MockNacDb } from '../../mocks/db'

const BASE_RUNTIME_CONFIG = {
  hub: { db: 'sqlite' },
  autoCrud: {
    statusFiltering: false,
    auth: { authorization: false, ownerKey: 'createdBy' },
    apiHiddenFields: [],
  },
  public: {
    autoCrud: { formHiddenFields: [], formReadOnlyFields: [], nacEndpointPrefix: '/api/_nac', apiBase: '/api/_nac' },
  },
}

const mockConfig = (overrides: Record<string, unknown> = {}) => {
  const overrideAutoCrud = (overrides.autoCrud ?? {}) as Record<string, unknown>
  return vi.mocked(useRuntimeConfig).mockReturnValue({
    ...BASE_RUNTIME_CONFIG,
    ...overrides,
    autoCrud: { ...BASE_RUNTIME_CONFIG.autoCrud, ...overrideAutoCrud },
  } as unknown as ReturnType<typeof useRuntimeConfig>)
}

vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm')
  return { ...actual, getColumns: vi.fn(table => table), or: actual.or, and: actual.and, eq: actual.eq, desc: actual.desc }
})

describe('nacGetRows() — relational query construction (relations fixture: products)', () => {
  let db: MockNacDb

  beforeEach(async () => {
    vi.clearAllMocks()
    mockConfig()
    db = await getNacDb() as unknown as MockNacDb
    db._ = { relations: { products: {} } }
    vi.mocked(isMysql).mockReturnValue(false)
    vi.mocked(hasActiveRelations).mockReturnValue(true) // this fixture genuinely configures relationsPath
    vi.mocked(nacGetTableQueryConfig).mockReturnValue({})
  })

  it('applies descending ID order by default when no explicit orderBy is configured', async () => {
    vi.mocked(db.query.products.findMany).mockResolvedValue([])
    await nacGetRows(products as unknown as NacTableWithId)

    expect(db.query.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { id: 'desc' } }),
    )
  })

  it('omits the where clause entirely when authorization is disabled (no filters to apply)', async () => {
    mockConfig({ autoCrud: { statusFiltering: false, auth: { authorization: false } } })
    vi.mocked(db.query.products.findMany).mockResolvedValue([])
    await nacGetRows(products as unknown as NacTableWithId, {})

    const callArgs = vi.mocked(db.query.products.findMany).mock.calls[0]![0]
    expect(callArgs.where).toBeUndefined()
  })

  it('passes limit and a cursor-derived where filter, with no offset key at all', async () => {
    vi.mocked(db.query.products.findMany).mockResolvedValue([])

    await nacGetRows(products as unknown as NacTableWithId, {}, { cursor: '7', limit: '2' })

    const callArgs = vi.mocked(db.query.products.findMany).mock.calls[0]![0]
    expect(callArgs.limit).toBe(3)
    expect(callArgs.offset).toBeUndefined() // omitted, not 0 — confirms the ternary branch, not just a default
    expect(callArgs.where).toBeDefined()
  })
})
