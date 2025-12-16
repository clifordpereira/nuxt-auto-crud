import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user || !(session.user as { id: number }).id) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const userId = (session.user as { id: number }).id

  // Fetch fresh user data
  const result = await db.select({
    user: schema.users,
    role: schema.roles.name
  })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(eq(schema.users.id, userId))
    .get()

  if (!result || !result.user) {
    // User deleted? Clear session
    await clearUserSession(event)
    throw createError({ statusCode: 401, message: 'User not found' })
  }

  const user = result.user
  const role = result.role || 'user'

  // Fetch permissions
  const permissions: Record<string, string[]> = {}

  if (user.roleId) {
    const permissionsData = await db.select({
      resource: schema.resources.name,
      action: schema.permissions.code
    })
      .from(schema.roleResourcePermissions)
      .innerJoin(schema.resources, eq(schema.roleResourcePermissions.resourceId, schema.resources.id))
      .innerJoin(schema.permissions, eq(schema.roleResourcePermissions.permissionId, schema.permissions.id))
      .where(eq(schema.roleResourcePermissions.roleId, user.roleId))
      .all()

    for (const p of permissionsData) {
      if (!permissions[p.resource]) {
        permissions[p.resource] = []
      }
      permissions[p.resource]!.push(p.action)
    }
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: role,
      permissions: permissions
    }
  })

  return { user: session.user }
})
