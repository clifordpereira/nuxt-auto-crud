import { defineRelations } from 'drizzle-orm'
import { users } from './users'
import { comments, categories } from './common'
import { testimonials, subscribers, notifications } from './template-schemas'
import { roles, permissions, resources, roleResourcePermissions } from './roles-n-permissions'
import { posts } from './cms'

/**
 * Standard Audit Relations
 * 
 * Maps createdBy and updatedBy fields to the users table.
 */
export const auditRelations = (r: any) => ({
  creator: r.one.users({
    from: r.tables.createdBy,
    to: r.users.id,
  }),
  updater: r.one.users({
    from: r.tables.updatedBy,
    to: r.users.id,
  }),
})

export const relations = defineRelations(
  {
    users,
    roles,
    permissions,
    resources,
    roleResourcePermissions,
    testimonials,
    subscribers,
    notifications,
    posts,
    comments,
    categories,
  },
  (r) => ({
    users: {
      assignedRole: r.one.roles({
        from: r.users.roleId,
        to: r.roles.id,
      }),
      notifications: r.many.notifications({
        from: r.users.id,
        to: r.notifications.userId,
      }),
      comments: r.many.comments({
        from: r.users.id,
        to: r.comments.authorId,
      }),
      ...auditRelations({ ...r, tables: r.users }),
    },

    roles: {
      users: r.many.users({
        from: r.roles.id,
        to: r.users.roleId,
      }),
      resourcePermissions: r.many.roleResourcePermissions({
        from: r.roles.id,
        to: r.roleResourcePermissions.roleId,
      }),
      ...auditRelations({ ...r, tables: r.roles }),
    },

    resources: {
      rolePermissions: r.many.roleResourcePermissions({
        from: r.resources.id,
        to: r.roleResourcePermissions.resourceId,
      }),
      ...auditRelations({ ...r, tables: r.resources }),
    },

    permissions: {
      rolePermissions: r.many.roleResourcePermissions({
        from: r.permissions.id,
        to: r.roleResourcePermissions.permissionId,
      }),
      ...auditRelations({ ...r, tables: r.permissions }),
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
      ...auditRelations({ ...r, tables: r.roleResourcePermissions }),
    },

    posts: {
      category: r.one.categories({
        from: r.posts.categoryId,
        to: r.categories.id,
      }),
      ...auditRelations({ ...r, tables: r.posts }),
    },

    categories: {
      posts: r.many.posts({
        from: r.categories.id,
        to: r.posts.categoryId,
      }),
      ...auditRelations({ ...r, tables: r.categories }),
    },

    comments: {
      author: r.one.users({
        from: r.comments.authorId,
        to: r.users.id,
      }),
      ...auditRelations({ ...r, tables: r.comments }),
    },

    notifications: {
      user: r.one.users({
        from: r.notifications.userId,
        to: r.users.id,
      }),
      ...auditRelations({ ...r, tables: r.notifications }),
    },

    testimonials: {
      ...auditRelations({ ...r, tables: r.testimonials }),
    },

    subscribers: {
      ...auditRelations({ ...r, tables: r.subscribers }),
    },
  }),
)
