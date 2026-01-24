import { eventHandler, setResponseHeaders } from 'h3'
import { addClient, removeClient } from '../utils/sse-bus'

import { kv } from '@nuxthub/kv'


export default eventHandler(async (event) => {
  const id = crypto.randomUUID()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  let lastSeenTs = Date.now()

  addClient(id, writer)

  const encoder = new TextEncoder()

  // Heartbeat & Global Sync
  const signalCheck = setInterval(async () => {
    try {
      const signal = await kv.get<{ ts: number, payload: any }>('nac_signal')
      
      if (signal && signal.ts > lastSeenTs) {
        lastSeenTs = signal.ts
        const msg = `event: crud\ndata: ${JSON.stringify(signal.payload)}\n\n`
        await writer.write(encoder.encode(msg))
      } else {
        // Keep-alive ping to prevent Cloudflare from closing the connection
        await writer.write(encoder.encode(': ping\n\n'))
      }
    } catch (e) {
      console.error('[nac:sse] KV Signal Check Error:', e)
      // Do NOT kill the stream on KV error; just log and continue local heartbeat
    }
  }, 3000)

  const cleanup = () => {
    clearInterval(signalCheck)
    removeClient(id)
    try { writer.close() } catch {}
  }

  writer.closed.then(cleanup).catch(cleanup)

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  })

  return stream.readable
})