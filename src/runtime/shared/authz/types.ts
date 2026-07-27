
import type { Table } from 'drizzle-orm'

export interface NacAuthzSeedUser {
  name: string
  email: string
  password: string
  role: string
}

export interface NacAuthzSeedConfig {
  roles: Record<string, { permissions: 'all' | Record<string, string[] | string> }>
  presets?: Record<string, string[]>
  resources: string[]
  usersToSeed: NacAuthzSeedUser[]
}

export interface NacAuthzSchema {
  roles: Table
  resources: Table
  permissions: Table
  roleResourcePermissions: Table
  users: Table
}
