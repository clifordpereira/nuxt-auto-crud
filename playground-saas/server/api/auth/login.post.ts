import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '@nuxthub/db'
import { verifyUserPassword } from '#server/utils/hashing'
import { InvalidCredentialError } from '#server/utils/errors'
import { seedDatabase } from '#server/utils/seed'

import type { User } from '#server/db/schema/users'
import { refreshUserSession } from '#server/utils/auth'

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
})

export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse)

  // ... inside eventHandler
  let result: { user: User, role: string | null } | undefined = await db.select({
    user: schema.users,
    role: schema.roles.name,
  })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(eq(schema.users.email, body.email))
    .get()

  if (!result || !result.user) {
    const config = useRuntimeConfig(event)
    // Check if it's the admin trying to login for the first time
    if (body.email === config.adminEmail && body.password === config.adminPassword) {
      await seedDatabase()
      // Re-fetch user after seeding
      const seededUser = await db.select({
        user: schema.users,
        role: schema.roles.name,
      })
        .from(schema.users)
        .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
        .where(eq(schema.users.email, body.email))
        .get()

      if (seededUser && seededUser.user) {
        // Proceed with login logic using the newly seeded user
        result = seededUser
      }
      else {
        throw new InvalidCredentialError()
      }
    }
    else {
      throw new InvalidCredentialError()
    }
  }

  const isPasswordValid = await verifyUserPassword(result.user.password, body.password)

  if (!isPasswordValid) {
    throw new InvalidCredentialError()
  }

  // Use shared logic to set session and get full permissions
  const fullUser = await refreshUserSession(event, result.user.id)

  return { user: fullUser }
})
