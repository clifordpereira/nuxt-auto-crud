import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'
import { nacGetRows, getVisibilityFilters } from '../../../src/runtime/server/utils/queries'
import type { NacTableWithId } from '../../../src/runtime/server/types'
import { posts, users } from '#nac/schema'
import { nacGetTableQueryConfig, getNacDb, isMysql, hasActiveRelations } from '#nac/db'
import type { MockNacDb } from '../../mocks/db'

const BASE_RUNTIME_CONFIG = {
  hub: { db: 'sqlite' },
  autoCrud: { statusFiltering: false, auth: { authorization: false, ownerKey: 'createdBy' }, apiHiddenFields: [] },
  public: { autoCrud: { formHiddenFields: [], formReadOnlyFields: [], nacEndpointPrefix: '/api/_nac', apiBase: '/api/_nac' } },
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

describe('getVisibilityFilters() — pure status filtering (statusFiltering only, authorization disabled)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfig()
  })

  it('returns no filters when statusFiltering is disabled', () => {
    mockConfig({ autoCrud: { statusFiltering: false } })
    expect(getVisibilityFilters(posts as unknown as NacTableWithId, {})).toEqual([])
  })

  it('filters to active records when statusFiltering is enabled and the table has a status column', () => {
    mockConfig({ autoCrud: { statusFiltering: true } })
    expect(getVisibilityFilters(posts as unknown as NacTableWithId, {})).toHaveLength(1)
  })

  it('applies no filter, gracefully, when statusFiltering is enabled but the table has no status column', () => {
    // 'users' (basic fixture) has no status column
    mockConfig({ autoCrud: { statusFiltering: true } })
    expect(getVisibilityFilters(users as unknown as NacTableWithId, {})).toEqual([])
  })
})

describe('nacGetRows() — status filter reaches the plain-select branch (basic fixture has no relationsPath)', () => {
  let db: MockNacDb

  beforeEach(async () => {
    vi.clearAllMocks()
    mockConfig()
    db = await getNacDb() as unknown as MockNacDb
    vi.mocked(isMysql).mockReturnValue(false)
    // basic's nuxt.config.ts sets no relationsPath, so real usage resolves
    // hasActiveRelations() === false — override the mock's global default
    // (true) to match, so this exercises the plain db.select chain
    // nacGetRows actually falls back to for this fixture.
    vi.mocked(hasActiveRelations).mockReturnValue(false)
    vi.mocked(nacGetTableQueryConfig).mockReturnValue({})

    vi.mocked(db.select).mockReturnThis()
    vi.mocked(db.from).mockReturnThis()
    vi.mocked(db.where).mockReturnThis()
    vi.mocked(db.orderBy).mockReturnThis()
    vi.mocked(db.$dynamic).mockReturnThis()
    vi.mocked(db.all).mockResolvedValue([])
  })

  it('calls .where() with the active-status filter when statusFiltering is enabled', async () => {
    mockConfig({ autoCrud: { statusFiltering: true } })
    await nacGetRows(posts as unknown as NacTableWithId, {})
    expect(db.where).toHaveBeenCalled()
  })

  it('does not call .where() when statusFiltering is disabled', async () => {
    mockConfig({ autoCrud: { statusFiltering: false } })
    await nacGetRows(posts as unknown as NacTableWithId, {})
    expect(db.where).not.toHaveBeenCalled()
  })
})