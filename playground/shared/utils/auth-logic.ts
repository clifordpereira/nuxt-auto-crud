export const OWNERSHIP_ACTIONS = ['read', 'update', 'delete'] as const
export type OwnershipAction = typeof OWNERSHIP_ACTIONS[number]

export interface AuthUser {
  id?: string | number
  role?: string
  permissions?: Record<string, string[]>
}

/**
 * Checks if a user has explicit permission for an action on a model
 */
export function hasPermission(user: AuthUser | null, model: string, action: string): boolean {
  if (!user?.permissions) return false
  const resourcePermissions = user.permissions[model]
  return Array.isArray(resourcePermissions) && resourcePermissions.includes(action)
}

/**
 * Checks if a user has ownership-based permission for an action on a model
 */
export function hasOwnershipPermission(user: AuthUser | null, model: string, action: string): boolean {
  if (!user?.permissions) return false
  const resourcePermissions = user.permissions[model]
  return Array.isArray(resourcePermissions) && resourcePermissions.includes(`${action}_own`)
}

/**
 * Checks if a user is the owner based on available context data (without DB lookup)
 */
export function isOwner(user: AuthUser | null, model: string, context: any): boolean {
  if (!user || !context) return false
  
  const userId = String(user.id)

  // 1. Users table self-check: if updating own user record
  // Note: context.id represents the target record ID
  if (model === 'users' && context.id && String(context.id) === userId) {
    return true
  }

  // 2. Direct ownership fields in context
  const recordOwnerId = context.createdBy || context.userId || context.ownerId
  if (recordOwnerId && String(recordOwnerId) === userId) {
    return true
  }

  return false
}
