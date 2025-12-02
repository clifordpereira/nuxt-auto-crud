import { eq } from 'drizzle-orm'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse)
  const db = useDrizzle()

  const user = await db.select().from(tables.users).where(eq(tables.users.email, body.email)).get()

  if (!user || !await verifyPassword(user.password, body.password)) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role || 'user',
    },
  })

  return { user }
})
