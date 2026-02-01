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
