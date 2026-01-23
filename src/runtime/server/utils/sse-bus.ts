type SSEClient = {
  id: string
  res: any
}

const clients = new Map<string, SSEClient>()

export function addClient(id: string, res: any) {
  clients.set(id, { id, res })
}

export function removeClient(id: string) {
  clients.delete(id)
}

export function broadcast(event: string, payload: any) {
  const msg =
    `event: ${event}\n` +
    `data: ${JSON.stringify(payload)}\n\n`

  for (const { res } of clients.values()) {
    res.write(msg)
  }
}
