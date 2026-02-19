import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'
import { useRuntimeConfig } from '#imports'

describe('NAC: Basic Fixture Lifecycle', async () => {
  const model = 'posts'
  let recordId: number
  const { nacEndpointPrefix } = useRuntimeConfig().public.autoCrud

  it('POST: creates record with zero-config validation', async () => {
    const res = await $fetch<{ id: number }>(`${nacEndpointPrefix}/${model}`, {
      method: 'POST',
      body: { title: 'E2E Test', content: 'Minimal setup' },
    })
    expect(res.id).toBeDefined()
    recordId = res.id
  })

  it('GET: retrieves single record with correct structure', async () => {
    const res = await $fetch<{ id: number, title: string }>(`${nacEndpointPrefix}/${model}/${recordId}`)
    expect(res).toBeTypeOf('object')
    expect(res.id).toBe(recordId)
    expect(res.title).toBe('E2E Test')
  })

  it('GET: lists records with default ordering', async () => {
    const res = await $fetch<{ id: number }[]>(`${nacEndpointPrefix}/${model}`)
    expect(Array.isArray(res)).toBe(true)
    expect(res.find(r => r.id === recordId)).toBeDefined()
  })

  it('PATCH: updates record and returns sanitized data', async () => {
    const res = await $fetch<{ title: string }>(`${nacEndpointPrefix}/${model}/${recordId}`, {
      method: 'PATCH',
      body: { title: 'Updated' },
    })
    expect(res.title).toBe('Updated')
  })

  it('DELETE: removes record successfully', async () => {
    await $fetch(`${nacEndpointPrefix}/${model}/${recordId}`, { method: 'DELETE' })
    await expect($fetch(`${nacEndpointPrefix}/${model}/${recordId}`)).rejects.toThrow()
  })

  it('GET: returns 404 for non-existent record', async () => {
    try {
      await $fetch(`${nacEndpointPrefix}/${model}/999999`)
      throw new Error('Should have thrown 404')
    }
    catch (error: unknown) {
      expect((error as { response?: { status: number } }).response?.status).toBe(404)
    }
  })

  it('GET: returns 404 for invalid model name', async () => {
    try {
      await $fetch(`${nacEndpointPrefix}/unknown_table/1`)
      throw new Error('Should have thrown 404')
    }
    catch (error: unknown) {
      expect((error as { response?: { status: number } }).response?.status).toBe(404)
    }
  })
})
