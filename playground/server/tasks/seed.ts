import { eq } from 'drizzle-orm'
import * as tables from '../database/schema'

export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Run database seed task',
  },
  async run() {
    console.log('Running DB seed task...')

    // Only seed if we have a users table
    if (!tables.users) {
      return { result: 'skipped', reason: 'No users table found' }
    }

    const db = useDrizzle()
    const results = []

    // Seed Admin
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
      results.push('admin')
    }

    // Seed Moderator
    const existingModerator = await db.select().from(tables.users).where(eq(tables.users.email, 'moderator@example.com')).get()

    if (!existingModerator) {
      console.log('Seeding moderator user...')
      const hashedPassword = await hashPassword('$1Password')
      await db.insert(tables.users).values({
        email: 'moderator@example.com',
        password: hashedPassword,
        name: 'Moderator User',
        avatar: 'https://i.pravatar.cc/150?u=moderator',
        role: 'moderator',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log('Moderator user seeded.')
      results.push('moderator')
    }

    // Seed Manager
    const existingManager = await db.select().from(tables.users).where(eq(tables.users.email, 'manager@example.com')).get()

    if (!existingManager) {
      console.log('Seeding manager user...')
      const hashedPassword = await hashPassword('$1Password')
      await db.insert(tables.users).values({
        email: 'manager@example.com',
        password: hashedPassword,
        name: 'Manager User',
        avatar: 'https://i.pravatar.cc/150?u=manager',
        role: 'manager',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log('Manager user seeded.')
      results.push('manager')
    }

    // Seed Customer
    const existingCustomer = await db.select().from(tables.users).where(eq(tables.users.email, 'customer@example.com')).get()

    if (!existingCustomer) {
      console.log('Seeding customer user...')
      const hashedPassword = await hashPassword('$1Password')
      await db.insert(tables.users).values({
        email: 'customer@example.com',
        password: hashedPassword,
        name: 'Customer User',
        avatar: 'https://i.pravatar.cc/150?u=customer',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log('Customer user seeded.')
      results.push('customer')
    }

    return { result: 'success', seeded: results }
  },
})
