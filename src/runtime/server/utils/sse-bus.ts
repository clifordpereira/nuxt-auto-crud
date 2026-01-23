import type { ServerResponse } from 'node:http'

type SSEClient = {
  id: string
  res: ServerResponse
}

const clients = new Map<string, SSEClient>()

export function addClient(id: string, res: ServerResponse) {
  clients.set(id, { id, res })
}

export function removeClient(id: string) {
  clients.delete(id)
}

export function broadcast(event: string, payload: unknown) {
  const msg
    = `event: ${event}\n`
      + `data: ${JSON.stringify(payload)}\n\n`

  for (const { res } of clients.values()) {
    res.write(msg)
  }
}
