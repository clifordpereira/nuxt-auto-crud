import { text, integer, uniqueIndex, snakeCase } from 'drizzle-orm/sqlite-core'
import { auditFields, timestamps } from '../utils'
import { users } from './users'

export const roles = snakeCase.table('roles', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  ...timestamps,
})

export const resources = snakeCase.table('resources', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  ...auditFields(() => users.id),
})

export const permissions = snakeCase.table('permissions', {
  id: integer().primaryKey({ autoIncrement: true }),
  // list_all : list all records without any filters
  // list_own : list only own records
  // list : list all records with normal filters like (status filter, soft deletes)
  code: text({ enum: ['list_all', 'list', 'list_own', 'create', 'read', 'read_own', 'update', 'update_own', 'delete', 'delete_own'] }).notNull(),
  ...auditFields(() => users.id),
})

export const roleResourcePermissions = snakeCase.table('role_resource_permissions', {
  id: integer().primaryKey({ autoIncrement: true }),
  roleId: integer().notNull().references(() => roles.id, { onDelete: 'cascade' }),
  resourceId: integer().notNull().references(() => resources.id, { onDelete: 'cascade' }),
  permissionId: integer().notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  ...auditFields(() => users.id),
}, t => [
  uniqueIndex('unq_role_res_perm').on(t.roleId, t.resourceId, t.permissionId),
])

export type Role = typeof roles.$inferSelect
export type Resource = typeof resources.$inferSelect
export type Permission = typeof permissions.$inferSelect
export type RoleResourcePermission = typeof roleResourcePermissions.$inferSelect
