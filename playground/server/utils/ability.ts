import { defineAbility } from 'nuxt-authorization/utils'
import { getPublicPermissions } from './permissions'

export default defineAbility(async (user, model: string, action: string) => {
  // 1. Handle Public/Unauthenticated Access
  if (!user) {
    const publicPermissions = await getPublicPermissions()
    const resourcePermissions = publicPermissions[model]
    
    if (Array.isArray(resourcePermissions)) {
      return resourcePermissions.includes(action)
    }
    return false
  }

  // 2. Admin has full access
  if (user.role === 'admin') {
    return true
  }

  // 3. Check permissions from session (DB-driven)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resourcePermissions = (user as any)?.permissions?.[model]
  
  if (Array.isArray(resourcePermissions)) {
    return resourcePermissions.includes(action)
  }

  return false
})
