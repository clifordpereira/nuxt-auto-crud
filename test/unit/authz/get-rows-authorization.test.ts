// test/unit/authz/get-rows-authorization.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'
import { nacGetRows } from '../../../src/runtime/server/utils/queries'
import type { NacTableWithId } from '../../../src/runtime/server/types'
import { users } from '#nac/schema'
import { nacGetTableQueryConfig, getNacDb, isMysql, hasActiveRelations } from '#nac/db'
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

describe('nacGetRows() — authorization filtering (authz fixture: users)', () => {
  let db: MockNacDb

  beforeEach(async () => {
    vi.clearAllMocks()
    mockConfig()
    db = await getNacDb() as unknown as MockNacDb
    db._ = { relations: { users: {} } }
    vi.mocked(isMysql).mockReturnValue(false)
    vi.mocked(hasActiveRelations).mockReturnValue(true)
    vi.mocked(nacGetTableQueryConfig).mockReturnValue({})
  })

  it('applies hybrid status-OR-owner filter when list_active is granted', async () => {
    mockConfig({ autoCrud: { statusFiltering: true, auth: { authorization: true, ownerKey: 'createdBy' } } })
    vi.mocked(db.query.users.findMany).mockResolvedValue([])

    await nacGetRows(users as unknown as NacTableWithId, { userId: '1', resourcePermissions: ['list_active'] })

    expect(db.query.users.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.anything() }))
  })

  it('applies strict owner-only filter when only list_own is granted', async () => {
    mockConfig({ autoCrud: { statusFiltering: false, auth: { authorization: true, ownerKey: 'createdBy' } } })
    vi.mocked(db.query.users.findMany).mockResolvedValue([])

    await nacGetRows(users as unknown as NacTableWithId, { userId: '1', resourcePermissions: ['list_own'] })

    expect(db.query.users.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.anything() }))
  })
})