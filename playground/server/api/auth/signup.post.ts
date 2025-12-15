import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from 'hub:db'
import { hashUserPassword } from '../../utils/hashing'
import { UserAlreadyExistsError } from '../../utils/errors'

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, signupSchema.parse)

  // Check if user exists
  const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, body.email)).get()
  if (existingUser) {
    throw new UserAlreadyExistsError()
  }

  // Hash password
  const hashedPassword = await hashUserPassword(body.password)

  // Get default role (user)
  const defaultRole = await db.select().from(schema.roles).where(eq(schema.roles.name, 'user')).get()

  // Insert user
  const user = await db.insert(schema.users).values({
    name: body.name,
    email: body.email,
    password: hashedPassword,
    status: 'active',
    roleId: defaultRole?.id,
  }).returning().get()

  // Fetch permissions
  const permissions: Record<string, string[]> = {}

  if (user.roleId) {
    const permissionsData = await db.select({
      resource: schema.resources.name,
      action: schema.permissions.code,
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

  // Set session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: defaultRole?.name || 'user',
      permissions,
    },
  })

  return { user }
})
