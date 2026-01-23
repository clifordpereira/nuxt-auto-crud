import { onMounted, onBeforeUnmount } from '#imports'

export interface AutoCrudEvent {
  table: string
  action: 'create' | 'update' | 'delete'
  data: Record<string, unknown>
  primaryKey: string | number
}

export function useAutoCrudSSE(onEvent: (e: AutoCrudEvent) => void) {
  let source: EventSource | null = null

  onMounted(() => {
    source = new EventSource('/api/sse')

    source.addEventListener('crud', (e: MessageEvent) => {
      onEvent(JSON.parse(e.data))
    })
  })

  onBeforeUnmount(() => {
    source?.close()
  })
}
