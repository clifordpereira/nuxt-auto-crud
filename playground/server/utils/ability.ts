import { defineAbility } from 'nuxt-authorization/utils'
import config from '../../autocrud.config'

export default defineAbility((user, model: string, action: string) => {
  const role = user?.role || 'public'

  // Get resource config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resourceConfig = (config.resources as any)[model]
  if (!resourceConfig) {
    return false
  }

  // Get permissions for the current role
  const permissions = resourceConfig.auth?.[role]

  if (permissions === true) {
    return true
  }

  if (Array.isArray(permissions)) {
    return permissions.includes(action)
  }

  return false
})
