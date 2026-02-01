// src/runtime/types/index.d.ts
import type { H3Event } from 'h3'

declare module 'h3' {
  interface H3EventContext {
    /**
     * Injected by the App's Nitro Plugin
     * Fulfils the IoC contract for user resolution
     */
    $authorization?: {
      resolveServerUser: () => Promise<any | null>
    }
    isGuest?: boolean
  }
}

export {}
