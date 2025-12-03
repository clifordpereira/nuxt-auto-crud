import type { User as DbUser } from '../../server/utils/drizzle'

declare module '#auth-utils' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends Omit<DbUser, 'password' | 'createdAt' | 'updatedAt'> {}
}
