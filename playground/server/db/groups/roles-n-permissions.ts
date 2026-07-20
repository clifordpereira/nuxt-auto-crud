import { text, integer, uniqueIndex, snakeCase } from 'drizzle-orm/sqlite-core'
import { auditFields } from '../utils'

export const roles = snakeCase.table('roles', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  ...auditFields,
})

export const resources = snakeCase.table('resources', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  ...auditFields,
})

export const permissions = snakeCase.table('permissions', {
  id: integer().primaryKey({ autoIncrement: true }),
  // list_all : list all records without any filters
  // list_own : list only own records
  // list : list all records with normal filters like (status filter, soft deletes)
  code: text({ enum: ['list_all', 'list', 'list_own', 'create', 'read', 'read_own', 'update', 'update_own', 'delete', 'delete_own'] }).notNull(),
  ...auditFields,
})

export const roleResourcePermissions = snakeCase.table('role_resource_permissions', {
  roleId: integer().notNull().references(() => roles.id, { onDelete: 'cascade' }),
  resourceId: integer().notNull().references(() => resources.id, { onDelete: 'cascade' }),
  permissionId: integer().notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  ...auditFields,
}, t => [
  uniqueIndex('unq_role_res_perm').on(t.roleId, t.resourceId, t.permissionId)
])
