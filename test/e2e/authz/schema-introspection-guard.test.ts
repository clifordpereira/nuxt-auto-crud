import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

describe('NAC: Schema Introspection Bypasses Session Authentication', () => {
  it('GET /_schemas is accessible with no session, even with auth.authentication enabled', async () => {
    const res = await $fetch<string[]>('/api/_nac/_schemas')
    expect(Array.isArray(res)).toBe(true)
    expect(res).toContain('users')
  })

  it('GET /_schemas/:model is accessible with no session', async () => {
    const res = await $fetch<{ resource: string, fields: unknown[] }>('/api/_nac/_schemas/users')
    expect(res.resource).toBe('users')
    expect(Array.isArray(res.fields)).toBe(true)
  })

  it('a genuinely non-public data endpoint is still blocked without a session (regression guard)', async () => {
    await expect($fetch('/api/_nac/roles')).rejects.toMatchObject({ status: 401 })
  })
})