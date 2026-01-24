// server/utils/sse-bus.ts
type SSEClient = { id: string, res: WritableStreamDefaultWriter }
const clients = new Map<string, SSEClient>()
const encoder = new TextEncoder()

let bc: BroadcastChannel | null = null

const getBC = () => {
  if (!bc && typeof BroadcastChannel !== 'undefined') {
    bc = new BroadcastChannel('nac_updates')
    bc.onmessage = (event) => {
      if (event.data.type === 'crud') localBroadcast(event.data.payload)
    }
  }
  return bc
}

function localBroadcast(payload: unknown) {
  const msg = `event: crud\ndata: ${JSON.stringify(payload)}\n\n`
  const encoded = encoder.encode(msg)

  for (const [id, client] of clients) {
    client.res.write(encoded).catch(() => clients.delete(id))
  }
}

export function addClient(id: string, res: WritableStreamDefaultWriter) {
  clients.set(id, { id, res })
  getBC()
}

export function removeClient(id: string) {
  clients.delete(id)
}

export function broadcast(event: string, payload: unknown) {
  // 1. Alert local clients on this isolate
  localBroadcast(payload)
  // 2. Alert other isolates via Cloudflare/Browser BroadcastChannel
  const bus = getBC()
  if (bus) {
    bus.postMessage({ type: 'crud', payload })
  }
}
