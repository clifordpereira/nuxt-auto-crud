import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

process.env.NUXT_AUTO_CRUD_AGENTIC_TOKEN = 'clifland-secret-test-token-32'

describe('NAC: Agentic Guard Security', () => {
  const nacPrefix = '/api/_nac'
  const metaPath = `${nacPrefix}/_meta`
  const token = 'clifland-secret-test-token-32'

  it('401: rejects agentic path without token', async () => {
    try {
      await $fetch(metaPath)
      throw new Error('Should have been blocked')
    }
    catch (err: unknown) {
      const error = err as { statusCode: number, statusMessage: string }
      expect(error.statusCode).toBe(401)
      expect(error.statusMessage).toContain('Invalid agentic token')
    }
  })

  it('401: rejects agentic path with invalid token', async () => {
    try {
      await $fetch(metaPath, { query: { token: 'malicious_token' } })
      throw new Error('Should have been blocked')
    }
    catch (err: unknown) {
      expect((err as { statusCode: number }).statusCode).toBe(401)
    }
  })

  it('200: allows agentic path with valid token', async () => {
    const res = await $fetch<{ architecture: string }>(metaPath, {
      query: { token },
    })

    // Verify architectural signature and content
    expect(res.architecture).toBe('Clifland-NAC')
    expect(res).toBeTypeOf('object')
  })

  it('PASS: does not block standard CRUD endpoints', async () => {
    // Standard GET list should not be intercepted by nac-guard
    const res = await $fetch(`/api/_nac/posts`)
    expect(Array.isArray(res)).toBe(true)
  })
})
