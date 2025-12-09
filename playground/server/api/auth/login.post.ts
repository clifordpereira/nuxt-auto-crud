import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse)
  const db = useDrizzle()

  let result = await db.select({
    user: tables.users,
    role: tables.roles.name
  })
  .from(tables.users)
  .leftJoin(tables.roles, eq(tables.users.roleId, tables.roles.id))
  .where(eq(tables.users.email, body.email))
  .get()
  
  if (!result && body.email === 'admin@example.com') {
    const userCount = await db.select({ count: sql`count(*)` }).from(tables.users).get()
    if (userCount && userCount.count === 0) {
      await seedDatabase()
      // Fetch again
      result = await db.select({
        user: tables.users,
        role: tables.roles.name
      })
      .from(tables.users)
      .leftJoin(tables.roles, eq(tables.users.roleId, tables.roles.id))
      .where(eq(tables.users.email, body.email))
      .get()
    }
  }

  if (!result || !result.user || !await verifyPassword(result.user.password, body.password)) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  }

  const user = result.user
  const role = result.role || 'user'

  // Fetch permissions
  let permissions: Record<string, string[]> = {}
  
  if (user.roleId) {
    const permissionsData = await db.select({
      resource: tables.resources.name,
      action: tables.permissions.code
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

  return { user }
})
