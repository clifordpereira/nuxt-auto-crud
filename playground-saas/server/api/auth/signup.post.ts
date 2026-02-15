import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '@nuxthub/db'
import { hashUserPassword } from '#server/utils/hashing'
import { UserAlreadyExistsError } from '#server/utils/errors'
import { refreshUserSession } from '#server/utils/auth'

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.coerce.number().optional(),
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

  // Use provided roleId if it exists and is NOT a protected role
  let roleToAssign = defaultRole
  if (body.roleId) {
    const requestedRole = await db.select().from(schema.roles).where(eq(schema.roles.id, body.roleId)).get()
    if (requestedRole && !['public', 'user', 'manager', 'admin'].includes(requestedRole.name)) {
      roleToAssign = requestedRole
    }
  }

  // Insert user
  const user = await db.insert(schema.users).values({
    name: body.name,
    email: body.email,
    password: hashedPassword,
    status: 'active',
    roleId: roleToAssign?.id,
  }).returning().get()

  // Use shared logic to set session and get full permissions
  const fullUser = await refreshUserSession(event, user.id)

  return { user: fullUser }
})
