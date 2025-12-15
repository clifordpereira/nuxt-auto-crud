import type { User as DbUser } from '../../server/db/schema/users'

declare module '#auth-utils' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends Partial<DbUser> {
    role: string
    permissions: Record<string, string[]>
  }
}

export {}
