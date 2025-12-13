import type { users } from './db/schema/users'

type DrizzleUser = typeof users.$inferSelect

declare module '#auth-utils' {

  interface User extends Partial<DrizzleUser> {
    role: string
    permissions: Record<string, string[]>
  }
}

export {}
