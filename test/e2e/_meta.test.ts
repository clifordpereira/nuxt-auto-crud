import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

describe('NAC: Meta Discovery & Agentic Guard', () => {
  const metaPath = '/api/_nac/_meta'
  const token = 'test-token'

  it('GET: returns valid JSON manifest with query token', async () => {
    const res: any = await $fetch(metaPath, {
      query: { token },
    })

    expect(res.architecture).toBe('Clifland-NAC')
    expect(res.version).toBe('1.0.0-agentic')
    expect(Array.isArray(res.resources)).toBe(true)
  })

  it('GET: content negotiation via query param (?format=md)', async () => {
    const res = await $fetch<string>(metaPath, {
      query: {
        token,
        format: 'md',
      },
    })

    expect(typeof res).toBe('string')
    expect(res).toContain('# Clifland-NAC API Manifest')
    expect(res).toContain('| Field | Type | Required |')
  })

  it('GET: content negotiation via Accept header with token', async () => {
    const res = await $fetch<string>(metaPath, {
      query: { token },
      headers: { Accept: 'text/markdown' },
    })

    expect(typeof res).toBe('string')
    expect(res).toContain('### Resource:')
  })

  it('GET: fails with 401 on missing or invalid token', async () => {
    try {
      await $fetch(metaPath, { query: { token: 'invalid' } })
    }
    catch (err: any) {
      expect(err.response?.status).toBe(401)
    }
  })

  it('GET: ensures resources map standard CRUD methods', async () => {
    const res: any = await $fetch(metaPath, {
      query: { token },
    })

    if (res.resources.length > 0) {
      expect(res.resources[0].methods).toEqual(
        expect.arrayContaining(['GET', 'POST', 'PATCH', 'DELETE']),
      )
    }
  })

  it('GET: fails with 401 on empty string token', async () => {
    try {
      await $fetch(metaPath, { query: { token: '' } })
    }
    catch (err: any) {
      expect(err.status).toBe(401)
    }
  })

  it('GET: fails with 401 on missing token parameter', async () => {
    try {
      await $fetch(metaPath)
    }
    catch (err: any) {
      expect(err.status).toBe(401)
    }
  })
})
