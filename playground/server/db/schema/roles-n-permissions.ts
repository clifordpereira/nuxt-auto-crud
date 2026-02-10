import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { systemFields, baseFields, auditRelations } from './utils'
import { relations } from 'drizzle-orm'

/**
 * Roles
 * 
 * Roles are used to group permissions.
 */
export const roles = sqliteTable('roles', {
  ...systemFields,

  ...baseFields,
  name: text('name').notNull().unique(), // Override baseFields name to be unique
})
export const rolesRelations = relations(roles, (helpers) => ({
  ...auditRelations(helpers, roles, users),
  resourcePermissions: helpers.many(roleResourcePermissions),
  users: helpers.many(users),
}))

/**
 * Resources
 * 
 * Resources are used to group permissions.
 */
export const resources = sqliteTable('resources', {
  ...systemFields,

  ...baseFields,
  name: text('name').notNull().unique(), // Override baseFields name to be unique
})
export const resourcesRelations = relations(resources, (helpers) => ({
  ...auditRelations(helpers, resources, users),
  rolePermissions: helpers.many(roleResourcePermissions),
}))

/**
 * Permissions
 * 
 * Permissions are used to define what actions can be performed on resources.
 */
export const permissions = sqliteTable('permissions', {
  ...systemFields,

  ...baseFields,
  code: text('code', { enum: ['list', 'list_all', 'list_own', 'create', 'read', 'read_own', 'update', 'delete', 'update_own', 'delete_own'] }).notNull(),
})
export const permissionsRelations = relations(permissions, (helpers) => ({
  ...auditRelations(helpers, permissions, users),
  rolePermissions: helpers.many(roleResourcePermissions),
}))

/**
 * Role Resource Permissions
 * 
 * Role Resource Permissions are used to define what actions can be performed on resources.
 */
export const roleResourcePermissions = sqliteTable('role_resource_permissions', {
  ...systemFields,
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  resourceId: integer('resource_id').notNull().references(() => resources.id, { onDelete: 'cascade' }),
  permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => ({
  unq: uniqueIndex('unq_role_res_perm').on(t.roleId, t.resourceId, t.permissionId),
}))
export const roleResourcePermissionsRelations = relations(roleResourcePermissions, (helpers) => ({
  ...auditRelations(helpers, roleResourcePermissions, users),
  role: helpers.one(roles, {
    fields: [roleResourcePermissions.roleId],
    references: [roles.id],
  }),
  resource: helpers.one(resources, {
    fields: [roleResourcePermissions.resourceId],
    references: [resources.id],
  }),
  permission: helpers.one(permissions, {
    fields: [roleResourcePermissions.permissionId],
    references: [permissions.id],
  }),
}))
