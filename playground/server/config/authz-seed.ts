import { defineAuthzSeed } from '#imports'

export default defineAuthzSeed({
  usersToSeed: [
    { name: 'Admin User', email: 'admin@example.com', password: "$1Password", role: 'superadmin' },
    { name: 'Manager User', email: 'manager@example.com', password: "$1Password", role: 'useradmin' },
    { name: 'Moderator User', email: 'moderator@example.com', password: "$1Password", role: 'securityauditor' },
    { name: 'Customer User', email: 'customer@example.com', password: "$1Password", role: 'standarduser' },
  ],

  // Additional tables other than authz tables (users, roles, resources, permissions, role_resource_permissions)
  resources: [],

  presets: {
    readOnly: ['list', 'read'],
    manageOwn: ['read_own', 'update_own'],
  },

  roles: {
    superadmin: {
      permissions: 'all',
    },

    useradmin: {
      permissions: {
        users: ['list_all', 'create', 'read', 'update', 'delete'],
        roles: ['list', 'read'],
        permissions: ['list', 'read'],
        resources: ['list', 'read'],
        role_resource_permissions: ['list', 'read'],
      },
    },

    securityauditor: {
      permissions: {
        users: ['list', 'read'],
        roles: ['list', 'read'],
        permissions: ['list', 'read'],
        resources: ['list', 'read'],
        role_resource_permissions: ['list', 'read'],
      },
    },

    standarduser: {
      permissions: {
        users: ['read_own', 'update_own'],
        roles: ['list', 'read'],
        permissions: ['list', 'read'],
        resources: ['list', 'read'],
      },
    },
  }
})