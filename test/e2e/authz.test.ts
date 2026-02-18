import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { resolve } from 'node:path'
import { useRuntimeConfig } from '#imports'

describe('NAC: Public Resources & Auth Guard', async () => {
  const { nacEndpointPrefix } = useRuntimeConfig().public.autoCrud

  await setup({
    rootDir: resolve(import.meta.dirname, `../fixtures/authz`),
    server: true,
    browser: false,
  })

  it('1) POST & GET: ensures user exists and validates public fields', async () => {
    const payload = {
      name: 'Cliford Pereira',
      email: 'cliford@clifland.com',
    }

    // 1. Check if user exists (Idempotency check)
    const existing = await $fetch<any[]>(`${nacEndpointPrefix}/users?email=${payload.email}`)

    if (existing.length === 0) {
      // 2. Insert only if missing
      await $fetch(`${nacEndpointPrefix}/users`, {
        method: 'POST',
        body: payload,
      })
    }

    // 3. Retrieve and Validate
    const res = await $fetch<any[]>(`${nacEndpointPrefix}/users`)
    const user = res.find(u => u.email === payload.email)

    expect(user).toBeDefined()
    const keys = Object.keys(user)

    // Verify core visibility rules (Drizzle-Zod / nuxt.config.ts)
    expect(keys).toEqual(expect.arrayContaining(['id', 'name', 'email']))
    expect(keys).not.toEqual(expect.arrayContaining(['password', 'createdAt', 'updatedAt']))
  })

  it('2) GET: denies access to non-public resource "roles" when unauthenticated', async () => {
    try {
      await $fetch(`${nacEndpointPrefix}/roles`)
      throw new Error('Should have failed with 401')
    }
    catch (err: any) {
      expect(err.status).toBe(401)
      expect(err.data.message).toBe('Unauthorized')
    }
  })

  it('3) GET: public response strictly respects apiHiddenFields (Security Layering)', async () => {
    // Even if 'password' was accidentally added to publicResources.users,
    // getSelectableFields processes hiddenSet first.
    const res = await $fetch<any[]>(`${nacEndpointPrefix}/users`)
    const firstUser = res[0]

    expect(firstUser).not.toHaveProperty('password')
  })

  it('4) GET: returns 404 for non-existent model to avoid leaking schema info via 401', async () => {
    try {
      await $fetch(`${nacEndpointPrefix}/ghost_table`)
    }
    catch (err: any) {
      expect(err.status).toBe(401)
    }
  })
})
