import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'



export default defineNitroPlugin(async () => {
  onHubReady(async () => {
    const db = useDrizzle()
    
    // Check if admin exists
    const existingAdmin = await db.select().from(tables.users).where(eq(tables.users.email, 'admin@example.com')).get()
    
    if (!existingAdmin) {
      console.log('Seeding admin user...')
      const hashedPassword = await hash('$1Password', 10)
      await db.insert(tables.users).values({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        avatar: 'https://i.pravatar.cc/150?u=admin',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log('Admin user seeded.')
    } else if (existingAdmin.role !== 'admin') {
      await db.update(tables.users).set({ role: 'admin' }).where(eq(tables.users.email, 'admin@example.com'))
      console.log('Admin user role updated.')
    }
  })
})
