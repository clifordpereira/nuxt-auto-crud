import { describe, it, expect, vi, beforeEach } from 'vitest'

let db: any
let getPublicPermissions: any

describe('Public Permissions', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.useFakeTimers()
    const dbMod = await import('hub:db')
    db = dbMod.db
    const mod = await import('../../server/utils/permissions')
    getPublicPermissions = mod.getPublicPermissions
  })

  it('transforms joined join results into grouped resource/action record', async () => {
    // 1. Mock Role lookup
    vi.mocked(db.get).mockResolvedValueOnce({ id: 1, name: 'public' })
    
    // 2. Mock Permissions join result
    vi.mocked(db.all).mockResolvedValueOnce([
      { resource: 'posts', action: 'read' },
      { resource: 'posts', action: 'create' },
      { resource: 'users', action: 'read' }
    ])

    const result = await getPublicPermissions()

    expect(result).toEqual({
      posts: ['read', 'create'],
      users: ['read']
    })
  })

  it('returns empty record if public role is not found', async () => {
    vi.mocked(db.get).mockResolvedValueOnce(null)
    const result = await getPublicPermissions()
    expect(result).toEqual({})
    expect(db.select).toHaveBeenCalledTimes(1) // Only checked role
  })

  it('respects CACHE_TTL and does not query DB twice', async () => {
    vi.mocked(db.get).mockResolvedValue({ id: 1 })
    vi.mocked(db.all).mockResolvedValue([])

    // First call
    await getPublicPermissions()
    // Second call immediately
    await getPublicPermissions()

    expect(db.select).toHaveBeenCalledTimes(2) // Once for role, once for perms
  })

  it('refreshes cache after TTL expires', async () => {
    vi.mocked(db.get).mockResolvedValue({ id: 1 })
    vi.mocked(db.all).mockResolvedValue([])

    await getPublicPermissions()
    
    // Advance time by 61 seconds
    vi.advanceTimersByTime(61 * 1000)
    
    await getPublicPermissions()
    expect(db.select).toHaveBeenCalledTimes(4) // Re-queried
  })

  it('returns empty record if public role exists but has no permissions', async () => {
    vi.mocked(db.get).mockResolvedValueOnce({ id: 1, name: 'public' })
    vi.mocked(db.all).mockResolvedValueOnce([]) // No rows returned

    const result = await getPublicPermissions()
    expect(result).toEqual({})
  })

  it('handles database errors gracefully', async () => {
    vi.mocked(db.get).mockRejectedValue(new Error('DB Connection Lost'))

    await expect(getPublicPermissions()).rejects.toThrow('DB Connection Lost')
  })
})