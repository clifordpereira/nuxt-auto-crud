// server/utils/sse-bus.ts
import type { WritableStreamDefaultWriter } from 'node:stream/web'

type SSEClient = { id: string, res: WritableStreamDefaultWriter }
const clients = new Map<string, SSEClient>()
const encoder = new TextEncoder()

// 1. Create the Global Channel (Stateless)
const bc = new BroadcastChannel('nac_updates')

// 2. Listen for messages from OTHER isolates
bc.onmessage = (event) => {
  const { type, payload } = event.data
  if (type === 'crud') {
    localBroadcast(payload)
  }
}

export function addClient(id: string, res: WritableStreamDefaultWriter) {
  clients.set(id, { id, res })
}

export function removeClient(id: string) {
  clients.delete(id)
}

// 3. The local pusher (runs on every isolate that hears the broadcast)
function localBroadcast(payload: unknown) {
  const msg = `event: crud\ndata: ${JSON.stringify(payload)}\n\n`
  const encoded = encoder.encode(msg)

  for (const [id, client] of clients) {
    client.res.write(encoded).catch(() => clients.delete(id))
  }
}

// 4. The main entry point used in your index.post.ts
export function broadcast(event: string, payload: unknown) {
  // Send to our own local clients immediately
  localBroadcast(payload)
  // Send to all other isolates in this data center
  bc.postMessage({ type: 'crud', payload })
}
