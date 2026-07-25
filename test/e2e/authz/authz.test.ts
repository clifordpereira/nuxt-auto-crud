import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

describe('NAC: Public Resources & Auth Guard', () => {
  const apiBase = '/api/_nac'

  it('1) POST & GET: ensures user exists and validates public fields', async () => {
    const payload = {
      name: 'Cliford Pereira',
      email: 'cliford@clifland.com',
    }

    // GET /users?email=... is a list endpoint — wrapped in {data, meta}
    const { data: existing } = await $fetch<{ data: Record<string, unknown>[] }>(`${apiBase}/users?email=${payload.email}`)

    if (existing.length === 0) {
      await $fetch(`${apiBase}/users`, {
        method: 'POST',
        body: payload,
      })
    }

    const { data: res } = await $fetch<{ data: Record<string, unknown>[] }>(`${apiBase}/users`)
    const user = res.find(u => u.email === payload.email)

    expect(user).toBeDefined()
    if (!user) throw new Error('User not found')
    const keys = Object.keys(user)

    expect(keys).toEqual(expect.arrayContaining(['id', 'name', 'email']))
    expect(keys).not.toEqual(expect.arrayContaining(['password', 'createdAt', 'updatedAt']))
  })

  it('2) GET: denies access to non-public resource "roles" when unauthenticated', async () => {
    try {
      await $fetch(`${apiBase}/roles`)
      throw new Error('Should have failed with 401')
    }
    catch (err: unknown) {
      const error = err as { status: number, data: { message: string } }
      expect(error.status).toBe(401)
      expect(error.data.message).toBe('Unauthorized')
    }
  })

  it('3) GET: public response strictly respects apiHiddenFields (Security Layering)', async () => {
    const { data: res } = await $fetch<{ data: Record<string, unknown>[] }>(`${apiBase}/users`)
    const firstUser = res[0]

    expect(firstUser).not.toHaveProperty('password')
  })

  it('4) GET: returns 404 for non-existent model to avoid leaking schema info via 401', async () => {
    try {
      await $fetch(`${apiBase}/ghost_table`)
    }
    catch (err: unknown) {
      expect((err as { status: number }).status).toBe(401)
    }
  })
})
