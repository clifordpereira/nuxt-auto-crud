import { it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useNacAutoCrudSSE } from '../../src/runtime/composables/useNacAutoCrudSSE'
import { MockEventSource } from '../mocks/sse'

it('SSE: triggers callback within Nuxt context', async () => {
  const onEvent = vi.fn()
  let sourceInstance: any

  // Mock EventSource
  vi.spyOn(global, 'EventSource').mockImplementation((url) => {
    sourceInstance = new MockEventSource(url as string)
    return sourceInstance
  })

  const component = await mountSuspended({
    setup() {
      useNacAutoCrudSSE(onEvent)
      return () => null
    },
  })

  // Simulate server-side push
  const payload = { table: 'users', action: 'create', data: { id: 1 }, primaryKey: 1 }
  sourceInstance.emit('crud', payload)

  expect(onEvent).toHaveBeenCalledWith(payload)

  await component.unmount()
})
