import { defineAbility } from 'nuxt-authorization/utils'

let publicPermissionsPromise: Promise<Record<string, string[]>> | null = null

interface User {
  id?: string | number
  role?: string
  permissions?: Record<string, string[]>
}

// Update signature to accept context
export const abilityLogic = async (user: unknown, model: string, action: string, context?: Record<string, unknown> & { id?: string | number, createdBy?: string | number, userId?: string | number }) => {
  const userRecord = user as User

  // 1. Admin has full access
  if (userRecord?.role === 'admin') {
    return true
  }

  // 2. Check permissions from session (DB-driven) for logged-in users
  if (user) {
    const resourcePermissions = userRecord?.permissions?.[model]

    if (Array.isArray(resourcePermissions)) {
      if (resourcePermissions.includes(action)) {
        return true
      }

      // Check ownership permissions
      if ((action === 'update' && resourcePermissions.includes('update_own'))
        || (action === 'delete' && resourcePermissions.includes('delete_own'))) {
        if (context) {
          // Case A: Users table - User updates themselves
          if (model === 'users') {
            if (String(context.id) === String(userRecord.id)) {
              return true
            }
          }

          // Case B: Created By check
          if (context.createdBy && String(context.createdBy) === String(userRecord.id)) {
            return true
          }

          // Case C: Legacy userId check
          if (context.userId && String(context.userId) === String(userRecord.id)) {
            return true
          }
        }
      }
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
