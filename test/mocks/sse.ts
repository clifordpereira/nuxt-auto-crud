import { vi } from 'vitest'

export class MockEventSource {
  onmessage: any = null
  onerror: any = null
  listeners: Record<string, Function[]> = {}

  constructor(public url: string) {}

  addEventListener(type: string, cb: Function) {
    this.listeners[type] = this.listeners[type] || []
    this.listeners[type].push(cb)
  }

  // Helper to trigger events in tests
  emit(type: string, data: any) {
    this.listeners[type]?.forEach(cb => cb({ data: JSON.stringify(data) }))
  }

  close() { vi.fn() }
}
