// server/api/sse.ts
import { eventHandler, setResponseHeaders } from 'h3'
import { addClient, removeClient } from '../utils/sse-bus'

const encoder = new TextEncoder()

export default eventHandler(async (event) => {
  const id = crypto.randomUUID()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  addClient(id, writer)

  const ping = setInterval(() => {
    writer.write(encoder.encode(': ping\n\n')).catch(() => cleanup())
  }, 20000)

  const cleanup = () => {
    clearInterval(ping)
    removeClient(id)
    try {
      writer.close()
    }
    catch {
      // ignore stream closure errors
    }
  }

  writer.closed.then(cleanup).catch(cleanup)

  return stream.readable
})
