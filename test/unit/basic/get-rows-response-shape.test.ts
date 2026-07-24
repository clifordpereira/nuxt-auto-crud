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

describe('nacGetRows() — response shape (basic fixture, plain-select branch)', () => {
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
  })

  it('wraps results in {data, meta} with mode "simple" when no pagination params are given', async () => {
    vi.mocked(db.all).mockResolvedValue([{ id: 1 }, { id: 2 }])
    const result = await nacGetRows(posts as unknown as NacTableWithId, {}, {})
    expect(result.meta).toMatchObject({ mode: 'simple', perPage: 50, hasMore: false, page: 1 })
    expect(result.data).toHaveLength(2)
  })

  it('sets hasMore true and trims the extra row when more rows exist than limit', async () => {
    vi.mocked(db.all).mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]) // limit=2, +1 fetched
    const result = await nacGetRows(posts as unknown as NacTableWithId, {}, { limit: '2' })
    expect(result.data).toHaveLength(2)
    expect(result.meta.hasMore).toBe(true)
  })

  it('sets meta.mode "offset" and computes page from offset', async () => {
    vi.mocked(db.all).mockResolvedValue([])
    const result = await nacGetRows(posts as unknown as NacTableWithId, {}, { offset: '20', limit: '10' })
    expect(result.meta).toMatchObject({ mode: 'offset', page: 3 })
  })

  it('omits total unless ?total=true is present', async () => {
    vi.mocked(db.all).mockResolvedValue([])
    const result = await nacGetRows(posts as unknown as NacTableWithId, {}, {})
    expect(result.meta.total).toBeUndefined()
  })

  it('computes meta.total via a COUNT query only when ?total=true', async () => {
    vi.mocked(db.all).mockResolvedValue([])
    vi.mocked(db.get).mockResolvedValue({ count: 42 })
    const result = await nacGetRows(posts as unknown as NacTableWithId, {}, { total: 'true' })
    expect(result.meta.total).toBe(42)
  })

  it('sets nextCursor from the last row\'s id when in cursor mode with more rows', async () => {
    vi.mocked(db.all).mockResolvedValue([{ id: 10 }, { id: 9 }, { id: 8 }]) // limit=2, +1 fetched
    const result = await nacGetRows(posts as unknown as NacTableWithId, {}, { cursor: '20', limit: '2' })
    expect(result.meta.nextCursor).toBe('9')
  })
})