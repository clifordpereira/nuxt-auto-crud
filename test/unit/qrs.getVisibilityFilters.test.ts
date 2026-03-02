import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'
import { getVisibilityFilters, nacGetRows } from '../../src/runtime/server/utils/queries'

// Mock table structure
const mockTable = {
  id: { name: 'id' },
  status: { name: 'status' },
  createdBy: { name: 'createdBy' },
  // Drizzle internal key needed for some helpers
  _: { name: 'posts' } 
} as any

describe('getVisibilityFilters()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array when all features are disabled', () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      autoCrud: { statusFiltering: false, auth: { authorization: false } }
    } as any)

    const result = getVisibilityFilters(mockTable, {})
    expect(result).toEqual([])
  })

  it('should allow everything for list_all permission', () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      autoCrud: { statusFiltering: true, auth: { authorization: true } }
    } as any)

    const result = getVisibilityFilters(mockTable, { 
      resourcePermissions: ['list_all'] 
    })
    expect(result).toEqual([])
  })

  it('should enforce status=active when statusFiltering is on but auth is off', () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      autoCrud: { statusFiltering: true, auth: { authorization: false } }
    } as any)

    const result = getVisibilityFilters(mockTable, {})
    // Using Drizzle equality check
    expect(JSON.stringify(result[0])).toContain('status')
    expect(JSON.stringify(result[0])).toContain('active')
  })

  it('should apply hybrid filter (active OR own) for list_active permission', () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      autoCrud: { 
        statusFiltering: true, 
        auth: { authorization: true, ownerKey: 'createdBy' } 
      }
    } as any)

    const result = getVisibilityFilters(mockTable, {
      userId: 123,
      resourcePermissions: ['list_active']
    })

    const filterString = JSON.stringify(result[0])
    expect(filterString).toContain('active')
    expect(filterString).toContain('123')
  })

  it('should return empty filters if auth enabled but no permissions match', () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      autoCrud: { auth: { authorization: true }, statusFiltering: false }
    } as any)

    const result = getVisibilityFilters(mockTable, { resourcePermissions: [] })
    expect(result).toEqual([])
  })
})

describe('nacGetRows()', () => {
  it('should throw 403 when authorization is enabled but no list permissions exist', async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      autoCrud: { auth: { authorization: true } }
    } as any)

    // context with empty permissions
    const context = { resourcePermissions: [] }
    
    await expect(nacGetRows(mockTable, context))
      .rejects.toThrowError(expect.objectContaining({ statusCode: 403 }))
  })
})