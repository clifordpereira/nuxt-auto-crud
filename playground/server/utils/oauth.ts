import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import type { H3Event } from 'h3'

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
    } else {
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
        updatedAt: new Date()
      }).returning()
      user = newUser
    }
  }

  if (!user) {
    return sendRedirect(event, '/login?auth_error=user_creation_failed')
  }

  // Fetch permissions
  const permissions: Record<string, string[]> = {}
  if (user.roleId) {
    const permissionsData = await db.select({
      resource: schema.resources.name,
      action: schema.permissions.code
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

  const roleData = user.roleId ? (await db.select({ name: schema.roles.name }).from(schema.roles).where(eq(schema.roles.id, user.roleId)).get()) : null
  const roleName = roleData?.name || 'user'

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: roleName,
      permissions
    }
  })

  return sendRedirect(event, '/admin/dashboard')
}
