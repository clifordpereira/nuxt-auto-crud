import { defineRelations, type DBQueryConfig } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, r => ({
  roles: {
    users: r.many.users({
      from: r.roles.id,
      to: r.users.roleId,
    }),
    roleResourcePermissions: r.many.roleResourcePermissions({
      from: r.roles.id,
      to: r.roleResourcePermissions.roleId,
    }),
  },
  resources: {
    roleResourcePermissions: r.many.roleResourcePermissions({
      from: r.resources.id,
      to: r.roleResourcePermissions.resourceId,
    }),
  },
  permissions: {
    roleResourcePermissions: r.many.roleResourcePermissions({
      from: r.permissions.id,
      to: r.roleResourcePermissions.permissionId,
    }),
  },
  roleResourcePermissions: {
    role: r.one.roles({
      from: r.roleResourcePermissions.roleId,
      to: r.roles.id,
    }),
    resource: r.one.resources({
      from: r.roleResourcePermissions.resourceId,
      to: r.resources.id,
    }),
    permission: r.one.permissions({
      from: r.roleResourcePermissions.permissionId,
      to: r.permissions.id,
    }),
  },
  users: {
    role: r.one.roles({
      from: r.users.roleId,
      to: r.roles.id,
    }),
  },
}))

export const nacTableQueryConfig: Record<string, DBQueryConfig> = {
  users: {
    with: {
      role: { columns: { name: true } },
    },
  },
  roleResourcePermissions: {
    columns: {
      roleId: false,
      resourceId: false,
      permissionId: false,
    },
    with: {
      role: { columns: { name: true } },
      resource: { columns: { name: true } },
      permission: { columns: { code: true } },
    },
  },
}