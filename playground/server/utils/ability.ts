import { defineAbility } from 'nuxt-authorization/utils'
import config from '../../autocrud.config'

export default defineAbility((user, { can }) => {
  const role = user?.role || 'public'

  // Admin super-user override
  if (role === 'admin') {
    can('manage', 'all')
    return true
  }

  // Iterate over resources in autocrud config
  for (const [resourceName, resourceConfig] of Object.entries(config.resources)) {
    // Get permissions for the current role
    // @ts-expect-error - dynamic role access
    const permissions = resourceConfig.auth?.[role]

    if (permissions === true) {
      // Full access
      can('manage', resourceName)
    }
    else if (Array.isArray(permissions)) {
      // Specific permissions
      permissions.forEach((action) => {
        can(action, resourceName)
      })
    }
  }
  return true
})
