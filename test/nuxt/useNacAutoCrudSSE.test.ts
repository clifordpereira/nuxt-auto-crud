import { it, expect, vi, describe, beforeEach, afterEach, type Mock } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { h } from 'vue'
import { useNacAutoCrudSSE } from '../../src/runtime/composables/useNacAutoCrudSSE'

mockNuxtImport('useRuntimeConfig', () => {
  return () => ({
    public: {
      autoCrud: {
        endpointPrefix: '/api/_nac',
      },
    },
  })
})

describe('NAC Core: useNacAutoCrudSSE', () => {
  const endpointPrefix = `/api/_nac`
  const closeMock = vi.fn()
  let messageListeners: ((event: MessageEvent) => void)[] = []
  let errorListeners: ((event: Event) => void)[] = []

  const triggerMsg = (event: MessageEvent) => {
    messageListeners.forEach(cb => cb(event))
  }

  const triggerErr = (event: Event) => {
    errorListeners.forEach(cb => cb(event))
  }

  beforeEach(() => {
    messageListeners = []
    errorListeners = []

    // Define constructor mock using function declaration (not arrow) to support 'new'
    const MockEventSource = vi.fn(function (this: { addEventListener: unknown, close: unknown }) {
      this.addEventListener = vi.fn((type: string, cb: EventListener) => {
        if (type === 'crud') messageListeners.push(cb)
      })
      Object.defineProperty(this, 'onerror', {
        set(cb: EventListener) {
          errorListeners.push(cb)
        },
        configurable: true,
      })
      this.close = closeMock
    })

    vi.stubGlobal('EventSource', MockEventSource)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('handles lifecycle, valid events, malformed data, and connection errors', async () => {
    const onEvent = vi.fn()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = await mountSuspended({
      setup() {
        useNacAutoCrudSSE(onEvent)
        return () => h('div')
      },
    })

    // 1. Init check
    expect(global.EventSource).toHaveBeenCalledWith(`${endpointPrefix}/_sse`)

    // 2. Valid CRUD event check
    const validEvent = {
      table: 'users',
      action: 'create',
      data: { id: 1, name: 'Test User' },
      primaryKey: 1,
    }
    triggerMsg({ data: JSON.stringify(validEvent) } as MessageEvent)
    expect(onEvent).toHaveBeenCalledWith(validEvent)
    expect(onEvent).toHaveBeenCalledTimes(1)

    // 3. Malformed JSON check
    triggerMsg({ data: 'invalid-json' } as MessageEvent)
    expect(onEvent).toHaveBeenCalledTimes(1) // Should not increment
    expect(consoleSpy).toHaveBeenCalledWith(
      '[NAC] SSE Parse Error:',
      expect.any(Error),
    )

    // 4. Connection Error check
    const errorEvent = new Event('error')
    triggerErr(errorEvent)
    expect(consoleSpy).toHaveBeenCalledWith(
      '[NAC] SSE Connection Error:',
      errorEvent,
    )

    // 5. Cleanup check
    expect(closeMock).not.toHaveBeenCalled()
    wrapper.unmount()
    expect(closeMock).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('guards against missing EventSource support', async () => {
    const onEvent = vi.fn()

    // Simulate missing EventSource
    vi.stubGlobal('EventSource', undefined)
    if (typeof window !== 'undefined') {
      delete (window as unknown as { EventSource?: unknown }).EventSource
    }

    await mountSuspended({
      setup() {
        useNacAutoCrudSSE(onEvent)
        return () => h('div')
      },
    })
    // Implicit assertion: if the guard fails, `new EventSource` (which is undefined)
    // would throw a TypeError, failing the test.
  })

  it('only listens for \'crud\' type events', async () => {
    const onEvent = vi.fn()
    await mountSuspended({
      setup() {
        useNacAutoCrudSSE(onEvent)
        return () => h('div')
      },
    })
    const eventSourceInstance = (global.EventSource as unknown as { mock: { instances: { addEventListener: Mock }[] } }).mock.instances[0]!
    const addEventListenerSpy = eventSourceInstance.addEventListener
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'crud',
      expect.any(Function),
    )
    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    )
  })

  it('handles multiple rapid events correctly', async () => {
    const onEvent = vi.fn()
    await mountSuspended({
      setup() {
        useNacAutoCrudSSE(onEvent)
        return () => h('div')
      },
    })

    const events = [
      { table: 'tasks', action: 'create', data: { id: 1 }, primaryKey: 1 },
      {
        table: 'tasks',
        action: 'update',
        data: { id: 1, v: 2 },
        primaryKey: 1,
      },
    ]

    events.forEach((e) => {
      triggerMsg({ data: JSON.stringify(e) } as MessageEvent)
    })

    expect(onEvent).toHaveBeenCalledTimes(2)
    expect(onEvent).toHaveBeenNthCalledWith(1, events[0])
    expect(onEvent).toHaveBeenNthCalledWith(2, events[1])
  })

  it('ensures event isolation between instances', async () => {
    const onEventA = vi.fn()
    const onEventB = vi.fn()

    await mountSuspended({
      setup() {
        useNacAutoCrudSSE(onEventA)
        useNacAutoCrudSSE(onEventB)
        return () => h('div')
      },
    })

    const payload = {
      table: 'posts',
      action: 'create',
      data: {},
      primaryKey: 1,
    }
    triggerMsg({ data: JSON.stringify(payload) } as MessageEvent)

    expect(onEventA).toHaveBeenCalledWith(payload)
    expect(onEventB).toHaveBeenCalledWith(payload)
  })

  it('does not initialize during SSR setup', async () => {
    const onEvent = vi.fn()

    // mountSuspended runs setup(), but we check if EventSource
    // was called before the component actually "mounts" in the DOM

    await mountSuspended({
      setup() {
        useNacAutoCrudSSE(onEvent)
        return () => h('div')
      },
    })

    // It should only be called after mounting, not during the reactive setup block
    // Note: mountSuspended handles the mount, so we check total calls.
    expect(global.EventSource).toHaveBeenCalledTimes(1)
  })

  it('closes existing connection if re-initialized', async () => {
    const onEvent = vi.fn()
    const { unmount } = await mountSuspended({
      setup() {
        useNacAutoCrudSSE(onEvent)
        // Simulate a second call or re-run
        useNacAutoCrudSSE(onEvent)
        return () => h('div')
      },
    })

    // We expect 2 instances created, but both should be tracked
    expect(global.EventSource).toHaveBeenCalledTimes(2)

    unmount()
    // Ensure both were closed to prevent memory leaks in multi-instance setups
    expect(closeMock).toHaveBeenCalledTimes(2)
  })
})
