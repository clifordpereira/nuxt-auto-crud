import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
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
  code: text('code', { enum: ['list', 'list_all', 'create', 'read', 'update', 'delete'] }).notNull(),
})

export const roleResourcePermissions = sqliteTable('role_resource_permissions', {
  ...systemFields,
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  resourceId: integer('resource_id').notNull().references(() => resources.id, { onDelete: 'cascade' }),
  permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
})

// Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  resourcePermissions: many(roleResourcePermissions),
}))

export const resourcesRelations = relations(resources, ({ many }) => ({
  rolePermissions: many(roleResourcePermissions),
}))

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(roleResourcePermissions),
}))

export const roleResourcePermissionsRelations = relations(roleResourcePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [roleResourcePermissions.roleId],
    references: [roles.id],
  }),
  resource: one(resources, {
    fields: [roleResourcePermissions.resourceId],
    references: [resources.id],
  }),
  permission: one(permissions, {
    fields: [roleResourcePermissions.permissionId],
    references: [permissions.id],
  }),
}))
