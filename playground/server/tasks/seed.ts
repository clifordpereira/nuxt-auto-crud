export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Seed database with initial data'
  },
  async run() {
    console.log('Seeding database...')

    // const hashed_password = await hashPassword('$1Password')
    const hashed_password = "hashed_password"

    const roles = [{ name: 'Admin' }, { name: 'Manager' }, { name: 'Editor' }, { name: 'Guest' }]

    const resources = [ { name: 'users' }, { name: 'roles' }, { name: 'resources' }, { name: 'permissions' }, { name: 'role_resource_permissions' } ]

    const permissions = [
      { code: 'create' },
      { code: 'read' }, { code: 'read_own' },
      { code: 'update' }, { code: 'update_own' },
      { code: 'delete' }, { code: 'delete_own' },
      { code: 'list' }, { code: 'list_own' }, { code: 'list_all' },
      // { code: 'export' }, { code: 'export_own' },
    ]

    // Seeding full permission for admin
    let role_resource_permissions = (() => {
      const arr = []
      for (let j = 0; j < resources.length; j++) {
        for (let k = 0; k < permissions.length; k++) {
          arr.push({ roleId: 1, resourceId: j + 1, permissionId: k + 1 })
        }
      }
      return arr
    })()

    role_resource_permissions = [
      ...role_resource_permissions,
      { roleId: 2, resourceId: 1, permissionId: 4 }
    ]

    const users = [
      {
        name: 'Admin',
        role_id: 1,
        email: 'admin@example.com',
        password: hashed_password,
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      {
        name: 'Editor',
        role_id: 2,
        email: 'editor@example.com',
        password: hashed_password,
        avatar: 'https://i.pravatar.cc/150?img=2',
      }
    ]

    await db.insert(schema.roles).values(roles)
    await db.insert(schema.users).values(users)
    await db.insert(schema.resources).values(resources)
    await db.insert(schema.permissions).values(permissions)
    await db.insert(schema.roleResourcePermissions).values(role_resource_permissions)

    return { result: 'Database seeded successfully' }
  }
})
