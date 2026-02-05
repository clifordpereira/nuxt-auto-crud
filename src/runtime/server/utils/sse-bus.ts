// server/utils/sse-bus.ts
// @ts-expect-error - virtual import resolved by Nuxt/Nitro
import { kv } from '@nuxthub/kv'

export const instanceId = crypto.randomUUID()

type SSEClient = { id: string, res: WritableStreamDefaultWriter }
const clients = new Map<string, SSEClient>()
const encoder = new TextEncoder()

async function localBroadcast(payload: unknown) {
  const msg = `event: crud\ndata: ${JSON.stringify(payload)}\n\n`
  const encoded = encoder.encode(msg)
  const deliveries = []
  for (const [id, client] of clients) {
    deliveries.push(
      client.res.write(encoded).catch(() => {
        clients.delete(id)
      })
    )
  }
  await Promise.all(deliveries)
}

export function addClient(id: string, res: WritableStreamDefaultWriter) {
  clients.set(id, { id, res })
}

export function removeClient(id: string) {
  clients.delete(id)
}

export async function broadcast(payload: unknown) {
  // 1. Local Isolate Delivery (Immediate)
  await localBroadcast(payload)

  // 2. Global Instance Signal (Cross-Isolate)
  // We include instanceId so other instances (or this one) can filter out echoes
  await kv.set('nac_signal', {
    ts: Date.now(),
    payload,
    instanceId,
  }, { ttl: 60 })
}
