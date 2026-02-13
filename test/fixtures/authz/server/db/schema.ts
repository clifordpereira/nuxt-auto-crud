import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  bio: text('bio'),
})

export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
})

export const resources = sqliteTable('resources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
})

export const permissions = sqliteTable('permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull(),
  description: text('description'),
})

export const roleResourcePermissions = sqliteTable('role_resource_permissions', {
  roleId: integer('role_id').references(() => roles.id),
  resourceId: integer('resource_id').references(() => resources.id),
  permissionId: integer('permission_id').references(() => permissions.id),
})
