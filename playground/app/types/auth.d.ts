import type { User as DbUser } from '../../server/utils/drizzle'

declare module '#auth-utils' {
  interface User extends Omit<DbUser, 'password' | 'createdAt' | 'updatedAt'> {}
}
