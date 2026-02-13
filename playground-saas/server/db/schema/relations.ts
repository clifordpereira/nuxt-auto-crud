import { defineRelations, type AnyRelation } from 'drizzle-orm'
import * as schema from '#nac/schema'

/**
 * Standard Audit Relations Interface
 * Replaces 'any' with 'unknown' for strict linting.
 */
interface RelationsContext {
  one: {
    users: (args: { from: unknown, to: unknown }) => AnyRelation
  }
  tables: Record<string, unknown>
  users: { id: unknown }
}

export const auditRelations = (r: RelationsContext) => ({
  creator: r.one.users({ from: r.tables.createdBy, to: r.users.id }),
  updater: r.one.users({ from: r.tables.updatedBy, to: r.users.id }),
})

export const relations = defineRelations(
  {
    users: schema.users,
    roles: schema.roles,
    permissions: schema.permissions,
    resources: schema.resources,
    roleResourcePermissions: schema.roleResourcePermissions,
    testimonials: schema.testimonials,
    subscribers: schema.subscribers,
    notifications: schema.notifications,
  },
  (r) => {
    // Single cast helper to reduce code density
    const buildCtx = (table: unknown): RelationsContext => ({
      one: r.one as RelationsContext['one'],
      tables: table as Record<string, unknown>,
      users: r.users as RelationsContext['users'],
    })

    return {
      users: {
        assignedRole: r.one.roles({ from: r.users.roleId, to: r.roles.id }),
        notifications: r.many.notifications({ from: r.users.id, to: r.notifications.userId }),
        ...auditRelations(buildCtx(r.users)),
      },
      roles: {
        users: r.many.users({ from: r.roles.id, to: r.users.roleId }),
        resourcePermissions: r.many.roleResourcePermissions({ from: r.roles.id, to: r.roleResourcePermissions.roleId }),
        ...auditRelations(buildCtx(r.roles)),
      },
      resources: {
        rolePermissions: r.many.roleResourcePermissions({ from: r.resources.id, to: r.roleResourcePermissions.resourceId }),
        ...auditRelations(buildCtx(r.resources)),
      },
      permissions: {
        rolePermissions: r.many.roleResourcePermissions({ from: r.permissions.id, to: r.roleResourcePermissions.permissionId }),
        ...auditRelations(buildCtx(r.permissions)),
      },
      roleResourcePermissions: {
        role: r.one.roles({ from: r.roleResourcePermissions.roleId, to: r.roles.id }),
        resource: r.one.resources({ from: r.roleResourcePermissions.resourceId, to: r.resources.id }),
        permission: r.one.permissions({ from: r.roleResourcePermissions.permissionId, to: r.permissions.id }),
        ...auditRelations(buildCtx(r.roleResourcePermissions)),
      },
      notifications: {
        user: r.one.users({ from: r.notifications.userId, to: r.users.id }),
        ...auditRelations(buildCtx(r.notifications)),
      },
      testimonials: { ...auditRelations(buildCtx(schema.testimonials)) },
      subscribers: { ...auditRelations(buildCtx(schema.subscribers)) },
    }
  },
)
