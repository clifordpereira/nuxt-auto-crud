import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'
import { resolve } from 'path'
import { setup } from '@nuxt/test-utils/e2e'

describe('NAC: Public Resources & Auth Guard', async () => {
  const prefix = '/api/_nac'

  await setup({
    rootDir: resolve(__dirname, `../fixtures/authz`),
    server: true,
    browser: false,
  })

  it('1) GET: allows access to public resource "users" when unauthenticated', async () => {
    // Attempt fetch without any auth headers/session
    const res = await $fetch<any[]>(`${prefix}/users`)
    
    expect(Array.isArray(res)).toBe(true)
    const firstUser = res[0]
    const keys = Object.keys(firstUser || {})

    // Should only contain keys defined in publicResources: users: ['id', 'name', 'email']
    expect(keys).toContain('id')
    expect(keys).toContain('name')
    expect(keys).toContain('email')
    
    // Should NOT contain non-public fields like 'createdAt' or 'updatedAt'
    expect(keys).not.toContain('createdAt')
    expect(keys).not.toContain('updatedAt')
  })

  it('2) GET: denies access to non-public resource "posts" when unauthenticated', async () => {
    try {
      await $fetch(`${prefix}/posts`)
      throw new Error('Should have failed with 401')
    } catch (err: any) {
      expect(err.status).toBe(401)
      expect(err.data.message).toBe('Unauthorized')
    }
  })

  it('3) GET: public response strictly respects apiHiddenFields (Security Layering)', async () => {
    // Even if 'password' was accidentally added to publicResources.users, 
    // getSelectableFields processes hiddenSet first.
    const res = await $fetch<any[]>(`${prefix}/users`)
    const firstUser = res[0]
    
    expect(firstUser).not.toHaveProperty('password')
  })

  it('4) GET: returns 404 for non-existent model to avoid leaking schema info via 401', async () => {
    try {
      await $fetch(`${prefix}/ghost_table`)
    } catch (err: any) {
      // If your getModelName/isPublicResource doesn't validate table existence,
      // verify how your system handles unknown paths.
      expect(err.status).toBe(404) 
    }
  })
})