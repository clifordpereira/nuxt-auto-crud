import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'
import { nacGetRows } from '../../../src/runtime/server/utils/queries'
import type { NacTableWithId } from '../../../src/runtime/server/types'
import { posts } from '#nac/schema'
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

describe('nacGetRows() — pagination (basic fixture, plain-select branch)', () => {
  let db: MockNacDb

  beforeEach(async () => {
    vi.clearAllMocks()
    mockConfig()
    db = await getNacDb() as unknown as MockNacDb
    vi.mocked(isMysql).mockReturnValue(false)
    vi.mocked(hasActiveRelations).mockReturnValue(false) // basic has no relationsPath
    vi.mocked(nacGetTableQueryConfig).mockReturnValue({})

    vi.mocked(db.select).mockReturnThis()
    vi.mocked(db.from).mockReturnThis()
    vi.mocked(db.where).mockReturnThis()
    vi.mocked(db.orderBy).mockReturnThis()
    vi.mocked(db.$dynamic).mockReturnThis()
    vi.mocked(db.limit).mockReturnThis()
    vi.mocked(db.offset).mockReturnThis()
    vi.mocked(db.all).mockResolvedValue([])
  })

  it('applies the default limit/offset when no query params are given', async () => {
    await nacGetRows(posts as unknown as NacTableWithId, {}, {})
    expect(db.limit).toHaveBeenCalledWith(50)
    expect(db.offset).toHaveBeenCalledWith(0)
  })

  it('applies an explicit limit/offset from query params', async () => {
    await nacGetRows(posts as unknown as NacTableWithId, {}, { limit: '5', offset: '15' })
    expect(db.limit).toHaveBeenCalledWith(5)
    expect(db.offset).toHaveBeenCalledWith(15)
  })

  it('applies page-based pagination correctly', async () => {
    await nacGetRows(posts as unknown as NacTableWithId, {}, { page: '2', limit: '10' })
    expect(db.limit).toHaveBeenCalledWith(10)
    expect(db.offset).toHaveBeenCalledWith(10)
  })

  it('uses a cursor filter and skips offset entirely when a valid cursor is given', async () => {
    await nacGetRows(posts as unknown as NacTableWithId, {}, { cursor: '10', limit: '5' })
    expect(db.limit).toHaveBeenCalledWith(5)
    expect(db.offset).not.toHaveBeenCalled()
    expect(db.where).toHaveBeenCalled()
  })

  it('ignores offset/page params when a cursor is also present', async () => {
    await nacGetRows(posts as unknown as NacTableWithId, {}, { cursor: '10', offset: '999', page: '5' })
    expect(db.offset).not.toHaveBeenCalled()
  })

  it('falls back to offset-based pagination when no cursor is given', async () => {
    await nacGetRows(posts as unknown as NacTableWithId, {}, { limit: '5' })
    expect(db.offset).toHaveBeenCalledWith(0)
  })
})
