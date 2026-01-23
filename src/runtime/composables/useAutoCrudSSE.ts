import { onMounted, onBeforeUnmount } from '#imports'

export function useAutoCrudSSE(onEvent: (e: any) => void) {
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
