import { eventHandler } from 'h3'
import { addClient, removeClient } from '../utils/sse-bus'
import { randomUUID } from 'node:crypto'

export default eventHandler(async (event) => {
  const id = randomUUID()
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disables proxy buffering
  })

  addClient(id, writer)

  // Heartbeat to keep the Cloudflare connection from timing out
  const ping = setInterval(() => {
    writer.write(new TextEncoder().encode(': ping\n\n')).catch(() => {
      clearInterval(ping)
      removeClient(id)
    })
  }, 10000)

  // Clean up on disconnect
  event.node.req.on('close', () => {
    clearInterval(ping)
    removeClient(id)
    try {
      writer.close()
    }
    catch {
      // Ignore close errors
    }
  })

  return readable
})
