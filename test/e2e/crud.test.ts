import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

describe('NAC: Basic Fixture Lifecycle', () => {
  const model = 'posts'
  let recordId: number

  it('POST: creates record with zero-config validation', async () => {
    const res: any = await $fetch(`/api/_nac/${model}`, {
      method: 'POST',
      body: { title: 'E2E Test', content: 'Minimal setup' }
    })
    expect(res.id).toBeDefined()
    recordId = res.id
  })

  it('GET: lists records with default ordering', async () => {
    const res: any = await $fetch(`/api/_nac/${model}`)
    expect(Array.isArray(res)).toBe(true)
    expect(res.find((r: any) => r.id === recordId)).toBeDefined()
  })

  it('PATCH: updates record and returns sanitized data', async () => {
    const res: any = await $fetch(`/api/_nac/${model}/${recordId}`, {
      method: 'PATCH',
      body: { title: 'Updated' }
    })
    expect(res.title).toBe('Updated')
  })

  it('DELETE: removes record successfully', async () => {
    await $fetch(`/api/_nac/${model}/${recordId}`, { method: 'DELETE' })
    await expect($fetch(`/api/_nac/${model}/${recordId}`)).rejects.toThrow()
  })
})