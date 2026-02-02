import { eventHandler, setResponseHeaders } from 'h3'
import { addClient, removeClient } from '../../utils/sse-bus'
// @ts-expect-error - virtual import resolved by Nuxt/Nitro
import { kv } from '@nuxthub/kv'

export default eventHandler(async (event) => {
  const id = crypto.randomUUID()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()
  let lastSeenTs = Date.now()

  addClient(id, writer)

  const signalCheck = setInterval(async () => {
    try {
      // Replaced 'any' with 'unknown' for type safety
      const signal = await kv.get<{ ts: number, payload: unknown }>('nac_signal')

      if (signal && signal.ts > lastSeenTs) {
        lastSeenTs = signal.ts
        const msg = `event: crud\ndata: ${JSON.stringify(signal.payload)}\n\n`
        await writer.write(encoder.encode(msg))
      }
      else {
        await writer.write(encoder.encode(': ping\n\n'))
      }
    }
    catch (e) {
      console.error('[nac:sse] KV Signal Check Error:', e)
    }
  }, 3000)

  const cleanup = () => {
    clearInterval(signalCheck)
    removeClient(id)
    writer.close().catch(() => {
      // Handled empty block by moving catch logic to a no-op or logging
    })
  }

  // Split one-liner into two statements
  writer.closed
    .then(cleanup)
    .catch(cleanup)

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  return stream.readable
})
