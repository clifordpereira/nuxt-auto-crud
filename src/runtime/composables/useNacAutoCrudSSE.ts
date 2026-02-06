import { onMounted, onBeforeUnmount, useRuntimeConfig } from "#imports";

export interface AutoCrudEvent {
  table: string;
  action: "create" | "update" | "delete";
  data: Record<string, unknown>;
  primaryKey: string | number;
}

export function useNacAutoCrudSSE(onEvent: (e: AutoCrudEvent) => void) {
  let source: EventSource | null = null

  onMounted(() => {
    if (typeof window === 'undefined' || !('EventSource' in window)) return

    const config = useRuntimeConfig()
    const { endpointPrefix } = config.public.autoCrud
    const { apiSecretToken } = config
    source = new EventSource(`${endpointPrefix}/_sse?token=${encodeURIComponent(apiSecretToken as string)}`)

    // 1. Connection Error Handler
    source.onerror = (err) => {
      console.error('[NAC] SSE Connection Error:', err)
    }

    // 2. Custom Event Listener
    source.addEventListener('crud', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data)
        onEvent(payload)
      } catch (err) {
        console.error('[NAC] SSE Parse Error:', err)
      }
    })
  })

  onBeforeUnmount(() => {
    source?.close()
  })
}