import type { User as DrizzleUser } from './utils/drizzle'

declare module '#auth-utils' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends Partial<DrizzleUser> {
    role: string
    permissions: Record<string, string[]>
  }
}

export {}
