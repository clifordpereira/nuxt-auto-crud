import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'
import type { NacTableWithId } from '../../../src/runtime/server/types'
import { nacResolveAuthorizationFilters } from '../../../src/runtime/server/utils/queries'

const mockTable = {
  id: { name: 'id' },
  status: { name: 'status' },
  createdBy: { name: 'createdBy' },
  _: { name: 'posts' },
} as unknown as NacTableWithId

describe('nacResolveAuthorizationFilters() — pure, isolated (no DB/schema)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array when all features are disabled', () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      autoCrud: { statusFiltering: false, auth: { authorization: false } },
    } as unknown as ReturnType<typeof useRuntimeConfig>)

    expect(nacResolveAuthorizationFilters(mockTable, {})).toEqual([])
  })

  it('allows everything for list_all permission', () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      autoCrud: { statusFiltering: true, auth: { authorization: true } },
    } as unknown as ReturnType<typeof useRuntimeConfig>)

    const result = nacResolveAuthorizationFilters(mockTable, { resourcePermissions: ['list_all'] })
    expect(result).toEqual([])
  })

  it('enforces status=active when statusFiltering is on but auth is off', () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      autoCrud: { statusFiltering: true, auth: { authorization: false } },
    } as unknown as ReturnType<typeof useRuntimeConfig>)

    const result = nacResolveAuthorizationFilters(mockTable, {})
    expect(JSON.stringify(result[0])).toContain('status')
    expect(JSON.stringify(result[0])).toContain('active')
  })

  it('applies hybrid filter (active OR own) for "list" permission', () => {
    // 'list', not 'list_active' — matches the permissions.code enum.
    vi.mocked(useRuntimeConfig).mockReturnValue({
      autoCrud: { statusFiltering: true, auth: { authorization: true, ownerKey: 'createdBy' } },
    } as unknown as ReturnType<typeof useRuntimeConfig>)

    const result = nacResolveAuthorizationFilters(mockTable, { userId: 123, resourcePermissions: ['list'] })

    const filterString = JSON.stringify(result[0])
    expect(filterString).toContain('active')
    expect(filterString).toContain('123')
  })

  it('returns empty filters if auth enabled but no permissions match', () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      autoCrud: { auth: { authorization: true }, statusFiltering: false },
    } as unknown as ReturnType<typeof useRuntimeConfig>)

    expect(nacResolveAuthorizationFilters(mockTable, { resourcePermissions: [] })).toEqual([])
  })
})
