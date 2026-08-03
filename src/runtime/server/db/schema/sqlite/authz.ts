import { text, integer, uniqueIndex, snakeCase } from 'drizzle-orm/sqlite-core'
import { timestamps } from './utils'

export const roles = snakeCase.table('roles', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  isSuperadmin: integer('is_superadmin', { mode: 'boolean' }).notNull().default(false),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  ...timestamps,
})

export const resources = snakeCase.table('resources', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  ...timestamps,
})

export const permissions = snakeCase.table('permissions', {
  id: integer().primaryKey({ autoIncrement: true }),
  code: text().notNull().unique(),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  ...timestamps,
})

export const roleResourcePermissions = snakeCase.table('role_resource_permissions', {
  id: integer().primaryKey({ autoIncrement: true }),
  roleId: integer().notNull().references(() => roles.id, { onDelete: 'cascade' }),
  resourceId: integer().notNull().references(() => resources.id, { onDelete: 'cascade' }),
  permissionId: integer().notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  ...timestamps,
}, t => [
  uniqueIndex('unq_role_res_perm').on(t.roleId, t.resourceId, t.permissionId),
])

export type Role = typeof roles.$inferSelect
export type Resource = typeof resources.$inferSelect
export type Permission = typeof permissions.$inferSelect
export type RoleResourcePermission = typeof roleResourcePermissions.$inferSelect
