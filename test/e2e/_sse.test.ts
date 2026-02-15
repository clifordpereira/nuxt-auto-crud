import { describe, it, expect } from 'vitest'
import { $fetch, url } from '@nuxt/test-utils/e2e'
import { useRuntimeConfig } from '#imports'

describe('NAC: SSE & CRUD Broadcast', async () => {
  const { endpointPrefix } = useRuntimeConfig().public.autoCrud
  const model = 'posts'

  it('SSE: establishes connection and receives headers', async () => {
    // Use url() helper to get the absolute path for native fetch
    const response = await fetch(url(`${endpointPrefix}/_sse`), {
      headers: { Accept: 'text/event-stream' }
    })
    
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/event-stream')
    
    // Close the connection immediately to avoid hanging the test
    if (response.body) await response.body.cancel()
  })

  it('SSE: broadcasts event on record creation', async () => {
    // Standard $fetch works for triggering the POST logic
    const res: any = await $fetch(`${endpointPrefix}/${model}`, {
      method: 'POST',
      body: { title: 'SSE Trigger', content: 'Testing broadcast' }
    })

    expect(res.id).toBeDefined()
  })

  it('SSE: receives broadcast data on record creation', async () => {
    const response = await fetch(url(`${endpointPrefix}/_sse`), {
        headers: { Accept: 'text/event-stream' }
    })
    
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    // Trigger action while connection is open
    await $fetch(`${endpointPrefix}/${model}`, {
        method: 'POST',
        body: { title: 'SSE Test' }
    })

    // Read the stream
    const { value } = await reader.read()
    const chunk = decoder.decode(value)

    expect(chunk).toContain('event: crud')
    expect(chunk).toContain('SSE Test')
    
    await reader.cancel()
  })

  it('SSE: verifies KV signal for multi-instance sync', async () => {
    const model = 'posts'
    const testTitle = `KV-Test-${Date.now()}`
    
    await $fetch(`${endpointPrefix}/${model}`, {
        method: 'POST',
        body: { title: testTitle }
    })

    // @ts-expect-error - testing virtual hub
    const { kv } = await import('@nuxthub/kv')
    const signal: any = await kv.get('nac_signal')

    expect(signal).toBeDefined()
    expect(signal.payload.title).toBe(testTitle)
    expect(signal.instanceId).toBeDefined()
    })
})