import { eq } from 'drizzle-orm'
// @ts-expect-error - nuxt-auth-utils is a peer dependency
import { hashPassword } from 'nuxt-auth-utils/server'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'
// @ts-expect-error - #site/schema is an alias defined by the module
import * as tables from '#site/schema'
import { useAutoCrudConfig } from '../utils/config'
// @ts-expect-error - #imports is available in runtime
import { defineNitroPlugin } from '#imports'

export default defineNitroPlugin(async () => {
  // @ts-expect-error - onHubReady is auto-imported from @nuxthub/core
  onHubReady(async () => {
    const { auth } = useAutoCrudConfig()

    // Only seed if auth is enabled and we have a users table
    if (!auth?.authentication || !tables.users) {
      return
    }

    const db = useDrizzle()

    // Check if admin exists
    const existingAdmin = await db.select().from(tables.users).where(eq(tables.users.email, 'admin@example.com')).get()

    if (!existingAdmin) {
      console.log('Seeding admin user...')
      
      const hashedPassword = await hashPassword('$1Password')

      await db.insert(tables.users).values({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        avatar: 'https://i.pravatar.cc/150?u=admin',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log('Admin user seeded.')
    }
  })
})
