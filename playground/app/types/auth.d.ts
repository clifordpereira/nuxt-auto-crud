import type { User as DbUser } from '../../server/db/schema/users'

declare module '#auth-utils' {

  interface User extends Partial<DbUser> {
    role: string
    permissions: Record<string, string[]>
  }
}
