import { eq, and } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { hashUserPassword } from './hashing'

export const seedDatabase = async () => {
  console.log('Running DB seed task...')
  const results = []

  // 1. Seed Roles
  const rolesToSeed = ['admin', 'manager', 'moderator', 'customer', 'user', 'public']
  const roleIds: Record<string, number> = {}

  for (const roleName of rolesToSeed) {
    let role = await db.select().from(schema.roles).where(eq(schema.roles.name, roleName)).get()

    if (!role) {
      console.log(`Seeding role: ${roleName}...`)
      const [inserted] = await db.insert(schema.roles).values({
        name: roleName,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning()
      role = inserted
      console.log(`Role ${roleName} seeded.`)
    }

    if (role) {
      roleIds[roleName] = role.id
    }
  }

  // 2. Seed Resources
  const resourcesToSeed = ['users', 'subscribers', 'testimonials']
  const resourceIds: Record<string, number> = {}

  for (const resourceName of resourcesToSeed) {
    let resource = await db.select().from(schema.resources).where(eq(schema.resources.name, resourceName)).get()

    if (!resource) {
      console.log(`Seeding resource: ${resourceName}...`)
      const [inserted] = await db.insert(schema.resources).values({
        name: resourceName,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning()
      resource = inserted
    }
    if (resource) {
      resourceIds[resourceName] = resource.id
    }
  }

  // 3. Seed Permissions
  const permissionsToSeed = ['create', 'read', 'update', 'delete', 'update_own', 'delete_own', 'list', 'list_all']
  const permissionIds: Record<string, number> = {}

  for (const code of permissionsToSeed) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let permission = await db.select().from(schema.permissions).where(eq(schema.permissions.code, code as any)).get()

    if (!permission) {
      console.log(`Seeding permission: ${code}...`)
      // Nice formatting for name (update_own -> Update Own)
      const name = code.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

      const [inserted] = await db.insert(schema.permissions).values({
        name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: code as any,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning()
      permission = inserted
    }
    if (permission) {
      permissionIds[code] = permission.id
    }
  }

  // 4. Assign Permissions to Roles (Example: Manager gets all on users, Moderator gets read/list on users)
  const rolePermissionsConfig = [
    { role: 'manager', resource: 'users', perms: ['create', 'read', 'update', 'delete', 'list', 'list_all'] },
    { role: 'moderator', resource: 'users', perms: ['read', 'list'] },
    { role: 'user', resource: 'users', perms: ['read', 'update_own'] }, // Allow users to read and update their own profile
    { role: 'public', resource: 'users', perms: [] }, // Explicitly no permissions for public on users by default
    { role: 'public', resource: 'subscribers', perms: ['create'] }, // Allow public to subscribe
    { role: 'public', resource: 'testimonials', perms: ['create', 'read', 'list'] }, // Allow public to create and view testimonials (active only)
    { role: 'manager', resource: 'testimonials', perms: ['create', 'read', 'update', 'delete', 'list', 'list_all'] },
  ]

  for (const config of rolePermissionsConfig) {
    const rId = roleIds[config.role]
    const resId = resourceIds[config.resource]

    if (rId && resId) {
      for (const permCode of config.perms) {
        const pId = permissionIds[permCode]
        if (pId) {
          // Check existence
          const existing = await db.select().from(schema.roleResourcePermissions)
            .where(and(
              eq(schema.roleResourcePermissions.roleId, rId),
              eq(schema.roleResourcePermissions.resourceId, resId),
              eq(schema.roleResourcePermissions.permissionId, pId),
            ))
            .get()

          if (!existing) {
            await db.insert(schema.roleResourcePermissions).values({
              roleId: rId,
              resourceId: resId,
              permissionId: pId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            console.log(`Assigned ${permCode} on ${config.resource} to ${config.role}`)
          }
        }
      }
    }
  }

  // 5. Seed Users
  const config = useRuntimeConfig()
  const usersToSeed = [
    { email: config.adminEmail, name: 'Admin User', role: 'admin' },
    { email: 'manager@example.com', name: 'Manager User', role: 'manager' },
    { email: 'moderator@example.com', name: 'Moderator User', role: 'moderator' },
    { email: 'customer@example.com', name: 'Customer User', role: 'customer' },
  ]

  for (const userData of usersToSeed) {
    const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, userData.email)).get()

    if (!existingUser) {
      console.log(`Seeding user: ${userData.email}...`)
      const passwordToHash = userData.role === 'admin' ? '$1Password' : '$1Password'
      const hashedPassword = await hashUserPassword(passwordToHash)

      await db.insert(schema.users).values({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        avatar: `https://i.pravatar.cc/150?u=${userData.role}`,
        roleId: roleIds[userData.role],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log(`User ${userData.email} seeded.`)
      results.push(userData.role)
    }
  }

  return { result: 'success', seeded: results }
}
