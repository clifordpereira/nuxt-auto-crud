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

    const { endpointPrefix } = useRuntimeConfig().public.autoCrud
    source = new EventSource(`${endpointPrefix}/_sse`)

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