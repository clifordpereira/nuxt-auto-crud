import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'
import { useRuntimeConfig } from '#imports'

describe('NAC: Agentic Guard Security', () => {
  const metaPath = '/api/_nac/_meta'
  const config = useRuntimeConfig()
  const validToken = config.autoCrud.nacAgenticToken

  it('401: rejects agentic path without token', async () => {
    try {
      await $fetch(metaPath)
      throw new Error('Should have been blocked')
    } catch (err: any) {
      expect(err.statusCode).toBe(401)
      expect(err.statusMessage).toContain('Unauthorized access')
    }
  })

  it('401: rejects agentic path with invalid token', async () => {
    try {
      await $fetch(metaPath, { query: { token: 'malicious_token' } })
      throw new Error('Should have been blocked')
    } catch (err: any) {
      expect(err.statusCode).toBe(401)
    }
  })

  it('200: allows agentic path with valid token', async () => {
    const res: any = await $fetch(metaPath, { 
      query: { token: validToken } 
    })
    
    // Verify architectural signature and content
    expect(res.architecture).toBe('Clifland-NAC')
    expect(res).toBeTypeOf('object')
  })

  it('PASS: does not block standard CRUD endpoints', async () => {
    const { endpointPrefix } = config.public.autoCrud
    // Standard GET list should not be intercepted by nac-guard
    const res = await $fetch(`${endpointPrefix}/posts`)
    expect(Array.isArray(res)).toBe(true)
  })
})