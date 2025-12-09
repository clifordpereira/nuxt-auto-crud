import { defineAbility } from 'nuxt-authorization/utils'

let publicPermissionsPromise: Promise<Record<string, string[]>> | null = null

export default defineAbility(async (user, model: string, action: string) => {
  // 1. Handle Public/Unauthenticated Access
  if (!user) {
    if (!publicPermissionsPromise) {
      publicPermissionsPromise = $fetch<Record<string, string[]>>('/api/public-permissions')
        .catch((e) => {
          console.error('Failed to fetch public permissions', e)
          publicPermissionsPromise = null
          return {}
        })
    }
    const publicPermissions = await publicPermissionsPromise
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
