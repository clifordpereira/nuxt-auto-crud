import { eventHandler, setHeader } from 'h3'
import { addClient, removeClient } from '../utils/sse-bus'
import { randomUUID } from 'crypto'

export default eventHandler((event) => {
  console.log('SSE client connected')

  const res = event.node.res
  const req = event.node.req
  const id = randomUUID()

  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')

  res.flushHeaders?.()

  addClient(id, res)

  // heartbeat
  const heartbeat = setInterval(() => {
    res.write(': ping\n\n')
  }, 15000)

  req.on('close', () => {
    clearInterval(heartbeat)
    removeClient(id)
  })
})
