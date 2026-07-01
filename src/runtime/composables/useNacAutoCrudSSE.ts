import { onBeforeUnmount, onMounted } from 'vue'
import { useNacApiBase } from './useNacApiBase'

/**
 * Represents a real-time database synchronization event broadcasted 
 * by the Nuxt Auto CRUD module during mutations.
 * * @public
 */
export interface NacAutoCrudEvent {
  /**
   * The name of the database table where the mutation occurred.
   * * @example
   * ```ts
   * 'products'
   * ```
   */
  table: string

  /**
   * The type of database operation performed.
   */
  action: 'create' | 'update' | 'delete'

  /**
   * The actual payload or record details affected by the operation.
   */
  data: Record<string, unknown>

  /**
   * The unique identifier (ID or UUID) of the mutated database record.
   */
  primaryKey: string | number
}

/**
 * A composable that establishes a real-time Server-Sent Events (SSE) connection 
 * to listen for database mutations broadcasted by the Nuxt Auto CRUD module.
 * * @remarks
 * - **SSR Safe:** This function automatically guards against execution during Server-Side Rendering.
 * - **Lifecycle Managed:** Automatically opens the connection on component mount (`onMounted`) 
 * and cleanly tears it down before unmount (`onBeforeUnmount`) to prevent memory leaks.
 * * @param onEvent - A callback function invoked whenever a valid CRUD event is received.
 * * @example
 * ```ts
 * useNacAutoCrudSSE((event) => {
 * console.log(`Action: ${event.action} on table: ${event.table}`);
 * });
 * ```
 * * @public
 */
export function useNacAutoCrudSSE(onEvent: (e: NacAutoCrudEvent) => void) {
  let source: EventSource | null = null

  onMounted(() => {
    if (typeof window === 'undefined' || !('EventSource' in window)) return

    const apiBase = useNacApiBase()

    // Ensure trailing slashes don't double up, then point to the SSE endpoint
    const sseUrl = `${apiBase.replace(/\/$/, '')}/_sse`

    source = new EventSource(sseUrl)
    
    source.onerror = (err) => {
      console.error('[NAC] SSE Connection Error:', err)
    }

    source.addEventListener('crud', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data)
        onEvent(payload)
      }
      catch (err) {
        console.error('[NAC] SSE Parse Error:', err)
      }
    })
  })

  onBeforeUnmount(() => {
    source?.close()
  })
}