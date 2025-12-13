import { eq } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user || !(session.user as any).id) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const userId = (session.user as any).id
  const db = useDrizzle()

  // Fetch fresh user data
  const result = await db.select({
    user: tables.users,
    role: tables.roles.name,
  })
    .from(tables.users)
    .leftJoin(tables.roles, eq(tables.users.roleId, tables.roles.id))
    .where(eq(tables.users.id, userId))
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
      resource: tables.resources.name,
      action: tables.permissions.code,
    })
      .from(tables.roleResourcePermissions)
      .innerJoin(tables.resources, eq(tables.roleResourcePermissions.resourceId, tables.resources.id))
      .innerJoin(tables.permissions, eq(tables.roleResourcePermissions.permissionId, tables.permissions.id))
      .where(eq(tables.roleResourcePermissions.roleId, user.roleId))
      .all()

    for (const p of permissionsData) {
      if (!permissions[p.resource]) {
        permissions[p.resource] = []
      }
      permissions[p.resource].push(p.action)
    }
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: role,
      permissions: permissions,
    },
  })

  return { user: session.user }
})
