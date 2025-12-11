import { defineAbility } from 'nuxt-authorization/utils'

let publicPermissionsPromise: Promise<Record<string, string[]>> | null = null

interface User {
  role?: string
  permissions?: Record<string, string[]>
}

export const abilityLogic = async (user: unknown, model: string, action: string) => {
  const userRecord = user as User

  // 1. Admin has full access
  if (userRecord?.role === 'admin') {
    return true
  }

  // 2. Check permissions from session (DB-driven) for logged-in users
  if (user) {
    const resourcePermissions = userRecord?.permissions?.[model]

    if (Array.isArray(resourcePermissions) && resourcePermissions.includes(action)) {
      return true
    }
  }

  // 3. Fallback: Check Public/Unauthenticated Access
  // (Allows logged-in users to perform public actions if they don't have explicit overrides)
  if (!publicPermissionsPromise) {
    publicPermissionsPromise = $fetch<Record<string, string[]>>('/api/public-permissions')
      .catch((e) => {
        console.error('Failed to fetch public permissions', e)
        publicPermissionsPromise = null
        return {}
      })
  }
  const publicPermissions = await publicPermissionsPromise
  const resourcePublicPermissions = publicPermissions[model]

  if (Array.isArray(resourcePublicPermissions)) {
    return resourcePublicPermissions.includes(action)
  }

  return false
}

export default defineAbility(abilityLogic)
