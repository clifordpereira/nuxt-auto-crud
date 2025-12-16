import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from 'hub:db'
import { verifyUserPassword } from '../../utils/hashing'
import { InvalidCredentialError } from '../../utils/errors'

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
})

export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse)

  const result = await db.select({
    user: schema.users,
    role: schema.roles.name,
  })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(eq(schema.users.email, body.email))
    .get()

  if (!result || !result.user) {
    throw new InvalidCredentialError()
  }

  const isPasswordValid = await verifyUserPassword(result.user.password, body.password)

  if (!isPasswordValid) {
    throw new InvalidCredentialError()
  }

  const user = result.user
  const role = result.role || 'user'

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

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role,
      permissions,
    },
  })

  return { user }
})
