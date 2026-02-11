import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { systemFields, baseFields } from './utils'

export const roles = sqliteTable('roles', {
  ...systemFields,
  ...baseFields,
  name: text('name').notNull().unique(), // Override baseFields name to be unique
})

export const resources = sqliteTable('resources', {
  ...systemFields,
  ...baseFields,
  name: text('name').notNull().unique(), // Override baseFields name to be unique
})

export const permissions = sqliteTable('permissions', {
  ...systemFields,
  ...baseFields,
  code: text('code', { enum: ['list', 'list_all', 'list_own', 'create', 'read', 'read_own', 'update', 'delete', 'update_own', 'delete_own'] }).notNull(),
})

export const roleResourcePermissions = sqliteTable('role_resource_permissions', {
  ...systemFields,
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  resourceId: integer('resource_id').notNull().references(() => resources.id, { onDelete: 'cascade' }),
  permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => ({
  unq: uniqueIndex('unq_role_res_perm').on(t.roleId, t.resourceId, t.permissionId),
}))
