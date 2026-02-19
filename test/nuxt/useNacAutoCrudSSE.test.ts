import { it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useNacAutoCrudSSE } from '../../src/runtime/composables/useNacAutoCrudSSE'
import { MockEventSource } from '../mocks/sse'

it('SSE: triggers callback within Nuxt context', async () => {
  const onEvent = vi.fn()
  let sourceInstance: MockEventSource | undefined

  // Mock EventSource
  const originalEventSource = global.EventSource
  global.EventSource = vi.fn(function (url: string) {
    sourceInstance = new MockEventSource(url)
    return sourceInstance
  }) as any

  const component = await mountSuspended({
    setup() {
      useNacAutoCrudSSE(onEvent)
      return () => null
    },
  })

  expect(sourceInstance).toBeDefined()
  expect(sourceInstance?.url).toBe('/api/_nac/_sse')

  // Simulate server-side push
  const payload = {
    table: 'users',
    action: 'create' as const,
    data: { id: 1 },
    primaryKey: 1,
  }
  sourceInstance?.emit('crud', payload)

  expect(onEvent).toHaveBeenCalledWith(payload)

  const closeSpy = vi.spyOn(sourceInstance!, 'close')
  await component.unmount()
  expect(closeSpy).toHaveBeenCalled()

  global.EventSource = originalEventSource
})
