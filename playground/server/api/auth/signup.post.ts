import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from 'hub:db'

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
    throw createError({
      statusCode: 400,
      message: 'User already exists',
    })
  }

  // Hash password
  const hashedPassword = await hashPassword(body.password)

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

  // Set session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: defaultRole?.name || 'user',
      permissions: {},
    },
  })

  return { user }
})
