const globalState = globalThis as unknown as {
  _nac_sse_clients: Map<string, { id: string, res: WritableStreamDefaultWriter<Uint8Array> }>
}

globalState._nac_sse_clients ||= new Map()
const clients = globalState._nac_sse_clients

export async function broadcast(payload: unknown): Promise<void> {
  try {
    const encoder = new TextEncoder()
    const msg = encoder.encode(`event: crud\ndata: ${JSON.stringify(payload)}\n\n`)

    const deliveries: Promise<void>[] = []
    for (const [id, client] of clients) {
      deliveries.push(
        client.res.write(msg).catch(() => {
          clients.delete(id)
        }),
      )
    }
    await Promise.all(deliveries)
  }
  catch (error) {
    // Silent fail to protect the main CRUD execution flow
  }
}

export function addClient(id: string, res: WritableStreamDefaultWriter<Uint8Array>): void {
  clients.set(id, { id, res })
}

export function removeClient(id: string): void {
  clients.delete(id)
}
