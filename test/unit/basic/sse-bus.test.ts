import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  nacBroadcast,
  nacAddClient,
  nacRemoveClient,
} from '../../../src/runtime/server/utils/sse-bus'

describe('SSE Bus Core', () => {
  // Access global state to reset between tests
  const globalState = globalThis as unknown as {
    _nac_sse_clients: Map<string, { id: string, res: WritableStreamDefaultWriter<Uint8Array> }>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    if (globalState._nac_sse_clients) {
      globalState._nac_sse_clients.clear()
    }
  })

  it('removes client automatically on write failure', async () => {
    const mockWriter = {
      write: vi.fn().mockRejectedValue(new Error('Stream Closed')),
    }

    nacAddClient('stale-id', mockWriter as unknown as WritableStreamDefaultWriter<Uint8Array>)

    // First broadcast triggers the catch block
    await nacBroadcast({ test: true })

    expect(mockWriter.write).toHaveBeenCalled()
    expect(globalState._nac_sse_clients.has('stale-id')).toBe(false)
  })

  it('broadcasts to multiple clients with correct SSE format', async () => {
    const writer1 = { write: vi.fn().mockResolvedValue(undefined) }
    const writer2 = { write: vi.fn().mockResolvedValue(undefined) }
    const payload = { msg: 'hello' }

    nacAddClient('c1', writer1 as unknown as WritableStreamDefaultWriter<Uint8Array>)
    nacAddClient('c2', writer2 as unknown as WritableStreamDefaultWriter<Uint8Array>)

    await nacBroadcast(payload)

    const expectedData = new TextEncoder().encode(
      `event: crud\ndata: ${JSON.stringify(payload)}\n\n`,
    )

    expect(writer1.write).toHaveBeenCalledWith(expectedData)
    expect(writer2.write).toHaveBeenCalledWith(expectedData)
  })

  it('handles empty client map gracefully', async () => {
    await expect(nacBroadcast({ data: 'none' })).resolves.not.toThrow()
  })

  it('manually removes clients', async () => {
    const writer = { write: vi.fn() }
    nacAddClient('temp-id', writer as unknown as WritableStreamDefaultWriter<Uint8Array>)

    nacRemoveClient('temp-id')
    await nacBroadcast({ msg: 'test' })

    expect(writer.write).not.toHaveBeenCalled()
    expect(globalState._nac_sse_clients.size).toBe(0)
  })
})
