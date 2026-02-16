import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import type { FetchError } from 'ofetch'
import { resolve } from 'node:path'

describe('NAC: Config Overrides', async () => {
  const prefix = '/api/_nac'
  const validToken = 'test-token'
  const invalidToken = 'wrong-token'

  await setup({
    rootDir: resolve(__dirname, '../fixtures/config-changes'),
  })

  /* -------------------------------------------------------------------------- */
  /*                             USER AUTH TESTS                                */
  /* -------------------------------------------------------------------------- */

  it('Auth: blocks access when authentication is required', async () => {
    try {
      await $fetch(`${prefix}/users`)
      expect.fail('Expected 401 AuthenticationError')
    } catch (err) {
      console.log(err)
      const error = err as FetchError

      expect(error.statusCode).toBe(401)
      expect(error.response?._data?.data?.code).toBe('AuthenticationError')
      expect(error.response?._data?.data?.message).toBe('Authentication required')
    }
  })

  /* -------------------------------------------------------------------------- */
  /*                          AGENTIC TOKEN TESTS                               */
  /* -------------------------------------------------------------------------- */

  it('Agentic: blocks meta access without token', async () => {
    try {
      await $fetch(`${prefix}/_meta`)
      expect.fail('Expected 401 AuthenticationError')
    } catch (err) {
      const error = err as FetchError

      expect(error.statusCode).toBe(401)
      expect(error.response?._data?.data?.code).toBe('AuthenticationError')
    }
  })

  it('Agentic: blocks meta access with invalid token', async () => {
    try {
      await $fetch(`${prefix}/_meta`, {
        query: { token: invalidToken }
      })
      expect.fail('Expected 401 AuthenticationError')
    } catch (err) {
      const error = err as FetchError

      expect(error.statusCode).toBe(401)
      expect(error.response?._data?.data?.code).toBe('AuthenticationError')
      expect(error.response?._data?.data?.message).toBe('Invalid agentic token')
    }
  })

  it('Agentic: allows access to meta with valid token', async () => {
    const res = await $fetch<{
      architecture: string
      resources: unknown[]
    }>(`${prefix}/_meta`, {
      query: { token: validToken }
    })

    expect(res.architecture).toBe('Clifland-NAC')
    expect(Array.isArray(res.resources)).toBe(true)
  })
})
