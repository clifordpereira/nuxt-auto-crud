import { vi } from 'vitest'

/**
 * Fluent Drizzle Mock
 * Supports: .select().from().innerJoin().where().get() | .all()
 */
const fluentMock = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  get: vi.fn(),
  all: vi.fn(),
  run: vi.fn(),
  values: vi.fn(),
}

export const db = fluentMock

// Mock schema objects to satisfy Drizzle table/column references
export const schema = {
  roles: { id: 'roles.id', name: 'roles.name' },
  resources: { id: 'resources.id', name: 'resources.name' },
  permissions: { id: 'permissions.id', code: 'permissions.code' },
  roleResourcePermissions: {
    roleId: 'rrp.roleId',
    resourceId: 'rrp.resourceId',
    permissionId: 'rrp.permissionId',
  },
  users: { id: 'users.id', email: 'users.email' },
}
