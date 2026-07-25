import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'
import {
  nacGetRow,
  nacCreateRow,
  nacUpdateRow,
  nacDeleteRow,
} from '../../../src/runtime/server/utils/queries'
import { nacResolveOwnershipFilter } from '../../../src/runtime/server/utils/query-filters'
import { nacRequireOperationPermission } from '../../../src/runtime/server/utils/query-authorize'
import type { NacTableWithId } from '../../../src/runtime/server/types'
import { users } from '#nac/schema'
import { NacUnauthorizedAccessError, NacRecordNotFoundError, NacUpdateFailedError } from '../../../src/runtime/server/exceptions'
import { getNacDb, isMysql, hasActiveRelations } from '#nac/db'
import type { MockNacDb } from '../../mocks/db'

const BASE_RUNTIME_CONFIG = {
  hub: { db: 'sqlite' },
  autoCrud: { statusFiltering: false, auth: { authorization: false, ownerKey: 'createdBy' }, apiHiddenFields: [] },
  public: { autoCrud: { formHiddenFields: [], formReadOnlyFields: [], nacEndpointPrefix: '/api/_nac', apiBase: '/api/_nac' } },
}

const mockConfig = (overrides: Record<string, unknown> = {}) => {
  const overrideAutoCrud = (overrides.autoCrud ?? {}) as Record<string, unknown>
  const overrideAuth = (overrideAutoCrud.auth ?? {}) as Record<string, unknown>
  return vi.mocked(useRuntimeConfig).mockReturnValue({
    ...BASE_RUNTIME_CONFIG,
    ...overrides,
    autoCrud: { ...BASE_RUNTIME_CONFIG.autoCrud, ...overrideAutoCrud, auth: { ...BASE_RUNTIME_CONFIG.autoCrud.auth, ...overrideAuth } },
  } as unknown as ReturnType<typeof useRuntimeConfig>)
}

vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm')
  return { ...actual, getColumns: vi.fn(table => table), or: actual.or, and: actual.and, eq: actual.eq, desc: actual.desc }
})

describe('nacRequireOperationPermission()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfig()
  })

  it('is a no-op when authorization is disabled', () => {
    mockConfig({ autoCrud: { auth: { authorization: false } } })
    expect(() => nacRequireOperationPermission('update', {})).not.toThrow()
  })

  it('is a no-op for public resources regardless of permissions', () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    expect(() => nacRequireOperationPermission('delete', { isPublic: true, resourcePermissions: [] })).not.toThrow()
  })

  it('allows the full-access code (e.g. "update")', () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    expect(() => nacRequireOperationPermission('update', { resourcePermissions: ['update'] })).not.toThrow()
  })

  it('allows the own-only code (e.g. "delete_own")', () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    expect(() => nacRequireOperationPermission('delete', { resourcePermissions: ['delete_own'] })).not.toThrow()
  })

  it('throws when neither code is present', () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    expect(() => nacRequireOperationPermission('create', { resourcePermissions: ['read'] })).toThrow(NacUnauthorizedAccessError)
  })

  it('"create" has no own-only variant — "create_own" does not satisfy it', () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    expect(() => nacRequireOperationPermission('create', { resourcePermissions: ['create_own'] })).toThrow(NacUnauthorizedAccessError)
  })
})

describe('nacResolveOwnershipFilter()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfig()
  })

  it('returns undefined when authorization is disabled', () => {
    mockConfig({ autoCrud: { auth: { authorization: false } } })
    expect(nacResolveOwnershipFilter(users as unknown as NacTableWithId, {}, 'update')).toBeUndefined()
  })

  it('returns undefined (full access) when the caller has the bare operation code', () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    const filter = nacResolveOwnershipFilter(users as unknown as NacTableWithId, { resourcePermissions: ['update'], userId: '1' }, 'update')
    expect(filter).toBeUndefined()
  })

  it('returns a real filter when the caller only has the "_own" code', () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    const filter = nacResolveOwnershipFilter(users as unknown as NacTableWithId, { resourcePermissions: ['update_own'], userId: '1' }, 'update')
    expect(filter).toBeDefined()
  })

  it('returns undefined when "_own" is present but userId is missing', () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    const filter = nacResolveOwnershipFilter(users as unknown as NacTableWithId, { resourcePermissions: ['update_own'] }, 'update')
    expect(filter).toBeUndefined()
  })
})

describe('CRUD functions — permission gating (users table, sqlite branch)', () => {
  let db: MockNacDb

  beforeEach(async () => {
    vi.clearAllMocks()
    mockConfig()
    db = await getNacDb() as unknown as MockNacDb
    vi.mocked(isMysql).mockReturnValue(false)
    vi.mocked(hasActiveRelations).mockReturnValue(false)
    vi.mocked(db.select).mockReturnThis()
    vi.mocked(db.from).mockReturnThis()
    vi.mocked(db.insert).mockReturnThis()
    vi.mocked(db.update).mockReturnThis()
    vi.mocked(db.delete).mockReturnThis()
    vi.mocked(db.where).mockReturnThis()
    vi.mocked(db.set).mockReturnThis()
    vi.mocked(db.values).mockReturnThis()
    vi.mocked(db.returning).mockReturnThis()
  })

  it('nacGetRow rejects a caller with no read permission', async () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    await expect(nacGetRow(users as unknown as NacTableWithId, '1', { resourcePermissions: [] })).rejects.toThrow(NacUnauthorizedAccessError)
  })

  it('nacGetRow succeeds for a caller with "read_own" and restricts the where clause', async () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    vi.mocked(db.get).mockResolvedValue({ id: 1, name: 'Owned' })

    const result = await nacGetRow(users as unknown as NacTableWithId, '1', { resourcePermissions: ['read_own'], userId: '1' })
    expect(result.name).toBe('Owned')
    expect(db.where).toHaveBeenCalled()
  })

  it('nacGetRow returns RecordNotFoundError (not Unauthorized) when a "_own" caller\'s row lookup misses', async () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    vi.mocked(db.get).mockResolvedValue(null)
    await expect(nacGetRow(users as unknown as NacTableWithId, '999', { resourcePermissions: ['read_own'], userId: '1' })).rejects.toThrow(NacRecordNotFoundError)
  })

  it('nacCreateRow rejects a caller with no create permission', async () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    await expect(nacCreateRow(users as unknown as NacTableWithId, { name: 'X' }, { resourcePermissions: [] })).rejects.toThrow(NacUnauthorizedAccessError)
  })

  it('nacUpdateRow rejects a caller with no update permission', async () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    await expect(nacUpdateRow(users as unknown as NacTableWithId, '1', { name: 'X' }, { resourcePermissions: [] })).rejects.toThrow(NacUnauthorizedAccessError)
  })

  it('nacUpdateRow succeeds with "update" (full) and applies no ownership restriction', async () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    vi.mocked(db.returning).mockResolvedValue([{ id: 5 }])
    await nacUpdateRow(users as unknown as NacTableWithId, '5', { name: 'Edit' }, { resourcePermissions: ['update'], userId: '1' })
    expect(db.where).toHaveBeenCalled()
  })

  it('nacUpdateRow returns RecordNotFoundError (not UpdateFailedError) when a "_own" caller\'s row lookup misses', async () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    vi.mocked(db.returning).mockResolvedValue([]) // zero rows matched — either not-owned or genuinely missing

    await expect(
      nacUpdateRow(users as unknown as NacTableWithId, '999', { name: 'X' }, { resourcePermissions: ['update_own'], userId: '1' }),
    ).rejects.toThrow(NacRecordNotFoundError)
  })

  it('nacUpdateRow still throws UpdateFailedError (not RecordNotFoundError) when no ownership filter is in play', async () => {
  // Confirms the branch split doesn't regress the pre-existing "full access,
  // genuinely failed update" case (e.g. authorization disabled, or caller
  // has the bare "update" code — no ownershipFilter is constructed either way).
    mockConfig({ autoCrud: { auth: { authorization: false } } })
    vi.mocked(db.returning).mockResolvedValue([])

    await expect(
      nacUpdateRow(users as unknown as NacTableWithId, '1', { name: 'X' }, {}),
    ).rejects.toThrow(NacUpdateFailedError)
  })

  it('nacDeleteRow rejects a caller with no delete permission', async () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    await expect(nacDeleteRow(users as unknown as NacTableWithId, '1', { resourcePermissions: [] })).rejects.toThrow(NacUnauthorizedAccessError)
  })

  it('nacDeleteRow succeeds with "delete_own"', async () => {
    mockConfig({ autoCrud: { auth: { authorization: true } } })
    vi.mocked(db.get).mockResolvedValue({ id: 1, name: 'Deleted' })
    const res = await nacDeleteRow(users as unknown as NacTableWithId, '1', { resourcePermissions: ['delete_own'], userId: '1' })
    expect(res.name).toBe('Deleted')
  })
})
