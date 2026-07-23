import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'
import { eq, or } from 'drizzle-orm'
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

// eq/and/or are real (delegating to the actual implementation) but wrapped
// as spies, so tests can assert on WHICH conditions were built without
// inspecting Drizzle's internal SQL tree structure.
vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm')
  return {
    ...actual,
    getColumns: vi.fn(table => table),
    eq: vi.fn(actual.eq),
    and: vi.fn(actual.and),
    or: vi.fn(actual.or),
    desc: actual.desc,
  }
})

describe('nacGetRows() — status filtering composed with authorization + query-string equality filters (authz fixture: users)', () => {
  let db: MockNacDb

  beforeEach(async () => {
    vi.clearAllMocks()
    mockConfig()
    db = await getNacDb() as unknown as MockNacDb
    db._ = { relations: { users: {} } }
    vi.mocked(isMysql).mockReturnValue(false)
    vi.mocked(hasActiveRelations).mockReturnValue(true)
    vi.mocked(nacGetTableQueryConfig).mockReturnValue({})
    vi.mocked(db.query.users.findMany).mockResolvedValue([])
  })

  it('enforces status=active by default when statusFiltering is on, with no permissions in play', async () => {
    mockConfig({ autoCrud: { statusFiltering: true, auth: { authorization: false } } })

    await nacGetRows(users as unknown as NacTableWithId, {}, {})

    const eqCalls = vi.mocked(eq).mock.calls
    expect(eqCalls.some(([col, val]) => (col as { name: string }).name === 'status' && val === 'active')).toBe(true)
  })

  it('layers an explicit ?status=inactive query filter ON TOP of the enforced default — never replaces it', async () => {
    mockConfig({ autoCrud: { statusFiltering: true, auth: { authorization: false } } })

    await nacGetRows(users as unknown as NacTableWithId, {}, { status: 'inactive' })

    // Both conditions are present and AND-composed — a contradictory pair
    // (active AND inactive) yields zero rows, not a silent override of the
    // enforced default by the caller's query string.
    const eqCalls = vi.mocked(eq).mock.calls
    expect(eqCalls.some(([col, val]) => (col as { name: string }).name === 'status' && val === 'active')).toBe(true)
    expect(eqCalls.some(([col, val]) => (col as { name: string }).name === 'status' && val === 'inactive')).toBe(true)
  })

  it('"list_own" restricts to the caller\'s own rows; a query-string status filter narrows further, never widens', async () => {
    mockConfig({ autoCrud: { statusFiltering: false, auth: { authorization: true, ownerKey: 'createdBy' } } })

    await nacGetRows(users as unknown as NacTableWithId, { userId: '1', resourcePermissions: ['list_own'] }, { status: 'active' })

    const eqCalls = vi.mocked(eq).mock.calls
    // Column.name is the physical db name ('created_by'), not the JS key ('createdBy')
    expect(eqCalls.some(([col, val]) => (col as { name: string }).name === 'created_by' && val === 1)).toBe(true)
    expect(eqCalls.some(([col, val]) => (col as { name: string }).name === 'status' && val === 'active')).toBe(true)
  })

  it('hybrid "list" + statusFiltering builds OR(active, owned); a query-string filter still ANDs on top of that OR', async () => {
    mockConfig({ autoCrud: { statusFiltering: true, auth: { authorization: true, ownerKey: 'createdBy' } } })

    await nacGetRows(users as unknown as NacTableWithId, { userId: '1', resourcePermissions: ['list'] }, { status: 'inactive' })

    expect(vi.mocked(or)).toHaveBeenCalled()

    const eqCalls = vi.mocked(eq).mock.calls
    expect(eqCalls.some(([col, val]) => (col as { name: string }).name === 'status' && val === 'active')).toBe(true) // inside the OR
    expect(eqCalls.some(([col, val]) => (col as { name: string }).name === 'created_by' && val === 1)).toBe(true) // inside the OR
    expect(eqCalls.some(([col, val]) => (col as { name: string }).name === 'status' && val === 'inactive')).toBe(true) // caller's own filter, ANDed on top
  })

  it('"list_all" bypasses the enforced status default entirely, but an explicit query-string filter still applies', async () => {
    mockConfig({ autoCrud: { statusFiltering: true, auth: { authorization: true, ownerKey: 'createdBy' } } })

    await nacGetRows(users as unknown as NacTableWithId, { userId: '1', resourcePermissions: ['list_all'] }, { status: 'inactive' })

    const eqCalls = vi.mocked(eq).mock.calls
    // The enforced default (status=active) must NOT appear — list_all bypassed it.
    expect(eqCalls.some(([col, val]) => (col as { name: string }).name === 'status' && val === 'active')).toBe(false)
    // But the caller's own explicit filter still does — bypassing the
    // enforced default isn't the same as ignoring the caller's own request.
    expect(eqCalls.some(([col, val]) => (col as { name: string }).name === 'status' && val === 'inactive')).toBe(true)
  })

  it('a caller with zero list permissions is rejected before any filter is built at all', async () => {
    mockConfig({ autoCrud: { statusFiltering: true, auth: { authorization: true } } })

    await expect(
      nacGetRows(users as unknown as NacTableWithId, { userId: '1', resourcePermissions: [] }, { status: 'active' }),
    ).rejects.toThrow()
  })
})