// src/runtime/types/index.d.ts
import type { UserSession } from '#auth-utils'

declare module 'h3' {
  interface H3EventContext {
    $authorization?: {
      resolveServerUser: () => Promise<UserSession['user'] | null>
    }
    isGuest?: boolean
  }
}

declare module '@nuxthub/kv' {
  interface Storage {
    get<T = unknown>(key: string): Promise<T | null>
    set(key: string, value: unknown, options?: { ttl?: number }): Promise<void>
  }
  export const kv: Storage
}

// The Database Schema Bridge
declare module '#site/schema' {
  const schema: Record<string, any>
  export default schema
}

// The Authorization Bridge
declare module '#site/ability' {
  export interface Ability {
    (user: any, model: string, action: string, context?: any): Promise<boolean> | boolean
  }
  const ability: Ability
  export default ability
}

export {}
