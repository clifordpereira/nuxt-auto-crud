import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import type { H3Event } from 'h3'
import { createError } from 'h3'

export async function fetchUserWithPermissions(userId: number) {
  const result = await db.select({
    user: schema.users,
    role: schema.roles.name,
  })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(eq(schema.users.id, userId))
    .get()

  if (!result || !result.user) return null

  const user = result.user
  const role = result.role || 'user'

  const permissions = await fetchPermissionsForRole(user.roleId)

  return {
    ...user,
    role,
    permissions,
  }
}

export async function fetchPermissionsForRole(roleId: number | null) {
  const permissions: Record<string, string[]> = {}

  if (!roleId) return permissions

  const permissionsData = await db.select({
    resource: schema.resources.name,
    action: schema.permissions.code,
  })
    .from(schema.roleResourcePermissions)
    .innerJoin(schema.resources, eq(schema.roleResourcePermissions.resourceId, schema.resources.id))
    .innerJoin(schema.permissions, eq(schema.roleResourcePermissions.permissionId, schema.permissions.id))
    .where(eq(schema.roleResourcePermissions.roleId, roleId))
    .all()

  for (const p of permissionsData) {
    if (!permissions[p.resource]) {
      permissions[p.resource] = []
    }
    permissions[p.resource]!.push(p.action)
  }

  return permissions
}

export async function refreshUserSession(event: H3Event, userId: number) {
  const userData = await fetchUserWithPermissions(userId)

  if (!userData) {
    await clearUserSession(event)
    throw createError({ statusCode: 401, message: 'User not found' })
  }

  await setUserSession(event, {
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      role: userData.role,
      permissions: userData.permissions,
    },
  })

  return userData
}
