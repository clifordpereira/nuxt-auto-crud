import { eventHandler, setResponseHeaders } from 'h3'

import { addClient, removeClient } from '../../utils/sse-bus'

export default eventHandler(async (event) => {
  const id = crypto.randomUUID()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  addClient(id, writer)

  // Keep-alive heartbeat to prevent connection timeouts
  const heartbeat = setInterval(async () => {
    try {
      await writer.write(encoder.encode(': ping\n\n'))
    }
    catch (e) {
      cleanup()
    }
  }, 20000)

  const cleanup = () => {
    clearInterval(heartbeat)
    removeClient(id)
    writer.close().catch(() => { /* ignore */ })
  }

  // Handle client disconnection
  writer.closed.then(cleanup).catch(cleanup)

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  return stream.readable
})
