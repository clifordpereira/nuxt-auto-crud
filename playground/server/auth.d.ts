import { users } from './db/schema/users'

type DrizzleUser = typeof users.$inferSelect

declare module '#auth-utils' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends Partial<DrizzleUser> {
    role: string
    permissions: Record<string, string[]>
  }
}

export {}
