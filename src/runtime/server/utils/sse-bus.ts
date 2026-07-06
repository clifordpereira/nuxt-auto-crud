const globalState = globalThis as unknown as {
  _nac_sse_clients: Map<string, { id: string, res: WritableStreamDefaultWriter<Uint8Array> }>
}

globalState._nac_sse_clients ||= new Map()
const clients = globalState._nac_sse_clients

/**
 * Broadcasts a mutation payload to all connected Server-Sent Events clients.
 *
 * @param payload - The data structure representing the CRUD mutation event.
 * @returns A promise that resolves when the payload is written to all client writers.
 * @public
 */
export async function nacBroadcast(payload: unknown): Promise<void> {
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
  catch {
    // Silent fail to protect the main CRUD execution flow
  }
}

/**
 * Registers a new Client writer connection to the active Server-Sent Events bus.
 *
 * @param id - The unique connection identifier of the client.
 * @param res - The WritableStream default writer instance.
 * @public
 */
export function nacAddClient(id: string, res: WritableStreamDefaultWriter<Uint8Array>): void {
  clients.set(id, { id, res })
}

/**
 * Unregisters a client connection from the active Server-Sent Events bus.
 *
 * @param id - The unique connection identifier of the client to remove.
 * @public
 */
export function nacRemoveClient(id: string): void {
  clients.delete(id)
}
