import { vi } from 'vitest'

export class MockEventSource {
  onmessage: ((this: EventSource, ev: MessageEvent) => void) | null = null
  onerror: ((this: EventSource, ev: Event) => void) | null = null
  listeners: Record<string, ((event: Event) => void)[]> = {}

  constructor(public url: string) {}

  addEventListener(type: string, cb: (event: Event) => void) {
    this.listeners[type] = this.listeners[type] || []
    this.listeners[type].push(cb)
  }

  // Helper to trigger events in tests
  emit(type: string, data: unknown) {
    const event = {
      data: JSON.stringify(data),
      type,
    } as MessageEvent

    this.listeners[type]?.forEach(cb => cb(event))
  }

  close() {
    vi.fn()
  }
}
