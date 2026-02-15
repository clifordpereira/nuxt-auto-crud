import { eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'
import type { H3Event } from 'h3'
import { refreshUserSession } from '#server/utils/auth'

interface OAuthUser {
  email?: string | null
  name?: string | null
  avatar?: string | null
  providerId: string
  provider: 'github' | 'google'
}

export async function handleOAuthSuccess(event: H3Event, oauthUser: OAuthUser) {
  if (!oauthUser.email) {
    return sendRedirect(event, '/login?auth_error=no_email')
  }

  const providerField = oauthUser.provider === 'github' ? 'githubId' : 'googleId'

  let user = await db.select()
    .from(schema.users)
    .where(eq(schema.users[providerField], oauthUser.providerId))
    .get()

  if (!user) {
    // Check by email if user already exists
    user = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, oauthUser.email))
      .get()

    if (user) {
      // Link provider account
      await db.update(schema.users)
        .set({ [providerField]: oauthUser.providerId })
        .where(eq(schema.users.id, user.id))
    }
    else {
      // Create new user (assign default role 'user' if exists)
      const defaultRole = await db.select().from(schema.roles).where(eq(schema.roles.name, 'user')).get()
      const [newUser] = await db.insert(schema.users).values({
        name: oauthUser.name || 'User',
        email: oauthUser.email,
        [providerField]: oauthUser.providerId,
        avatar: oauthUser.avatar || '',
        password: '', // No password for social login users
        roleId: defaultRole?.id || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning()
      user = newUser
    }
  }

  if (!user) {
    return sendRedirect(event, '/login?auth_error=user_creation_failed')
  }

  // Use shared logic to set session and get full permissions
  await refreshUserSession(event, user.id)

  return sendRedirect(event, '/admin/dashboard')
}
