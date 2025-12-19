import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from 'hub:db'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, forgotPasswordSchema.parse)

  const user = await db.select()
    .from(schema.users)
    .where(eq(schema.users.email, body.email))
    .get()

  if (user) {
    const resetToken = crypto.randomUUID()
    const resetExpires = Date.now() + 3600000 // 1 hour

    await db.update(schema.users)
      .set({
        resetToken,
        resetExpires,
      })
      .where(eq(schema.users.id, user.id))

    // In a real app, send an email here.
    // For this playground, we'll log it and return it for demo purposes if in dev.
    console.log(`Password reset token for ${body.email}: ${resetToken}`)
    console.log(`Reset URL: http://localhost:3000/auth/reset-password?token=${resetToken}`)
  }

  return {
    message: 'If a user with that email exists, a password reset link has been sent.',
  }
})
