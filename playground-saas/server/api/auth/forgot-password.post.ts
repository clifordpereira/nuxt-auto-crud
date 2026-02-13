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

    const url = getRequestURL(event)
    const resetUrl = `${url.protocol}//${url.host}/auth/reset-password?token=${resetToken}`
    const config = useRuntimeConfig(event)
    const resendApiKey = config.resendApiKey

    const emailTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Password Reset</h2>
        <p>You requested a password reset for your account. Click the button below to set a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `

    const sendEmailTask = async () => {
      if (resendApiKey) {
        // PRODUCTION: Use Resend REST API
        await $fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: {
            from: config.emailFrom,
            to: user.email,
            subject: 'Password Reset Request',
            html: emailTemplate,
          },
        }).catch(err => console.error('Background Email Error (Resend):', err))
      }
      else {
        // LOCAL: Log to console (so you can copy the link in dev)
        console.warn('--- Development Email Log ---')
        console.warn(`To: ${user.email}`)
        console.warn(`Reset URL: ${resetUrl}`)
        console.warn('------------------------------')
      }
    }

    // Trigger the task in the background
    // event.waitUntil is supported by Nitro and native to Cloudflare Workers
    event.waitUntil(sendEmailTask())
  }

  return {
    message: 'If a user with that email exists, a password reset link has been sent.',
  }
})
