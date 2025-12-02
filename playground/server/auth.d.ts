import type { User as DrizzleUser } from './utils/drizzle'

declare module '#auth-utils' {
  interface User extends DrizzleUser {}
}

export {}
