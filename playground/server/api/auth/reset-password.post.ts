import { eq, and, gt } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from 'hub:db'
import { hashUserPassword } from '../../utils/hashing'

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, resetPasswordSchema.parse)

  const user = await db.select()
    .from(schema.users)
    .where(
      and(
        eq(schema.users.resetToken, body.token),
        gt(schema.users.resetExpires, Date.now()),
      ),
    )
    .get()

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or expired reset token.',
    })
  }

  const hashedPassword = await hashUserPassword(body.password)

  await db.update(schema.users)
    .set({
      password: hashedPassword,
      resetToken: null,
      resetExpires: null,
    })
    .where(eq(schema.users.id, user.id))

  return {
    message: 'Password has been successfully reset.',
  }
})
