import { db } from 'hub:db'
import type { H3Event } from 'h3'
import { createError } from 'h3'

// --- Cache State ---
let publicPermissionsCache: Record<string, string[]> | null = null
let lastCacheTime = 0
const CACHE_TTL = 60 * 1000

// --- Transformer ---
export function transformPermissions(
  resourcePermissions: { 
    resource: { name: string }; 
    permission: { code: string } 
  }[] = []
): Record<string, string[]> {
  return resourcePermissions.reduce((acc, rp) => {
    const resource = rp.resource.name
    acc[resource] ||= []
    acc[resource].push(rp.permission.code)
    return acc
  }, {} as Record<string, string[]>)
}

// --- Queries ---
export async function fetchPermissionsForRole(roleId: number | null) {
  if (!roleId) return {}
  const roleData = await db.query.roles.findFirst({
    where: (roles, { eq }) => eq(roles.id, roleId),
    with: {
      resourcePermissions: {
        with: {
          resource: { columns: { name: true } },
          permission: { columns: { code: true } },
        },
      },
    },
  })
  return transformPermissions(roleData?.resourcePermissions)
}

export async function fetchUserWithPermissions(userId: number) {
  const result = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    columns: { password: false },
    with: {
      assignedRole: {
        with: {
          resourcePermissions: {
            with: {
              resource: { columns: { name: true } },
              permission: { columns: { code: true } },
            },
          },
        },
      },
    },
  })

  if (!result) return null

  return {
    ...result,
    role: result.assignedRole?.name || 'user',
    permissions: transformPermissions(result.assignedRole?.resourcePermissions),
  }
}

export async function getPublicPermissions(): Promise<Record<string, string[]>> {
  const now = Date.now()
  if (publicPermissionsCache && (now - lastCacheTime < CACHE_TTL)) return publicPermissionsCache

  const publicRole = await db.query.roles.findFirst({
    where: (roles, { eq }) => eq(roles.name, 'public'),
    columns: { id: true }
  })

  const permissions = publicRole ? await fetchPermissionsForRole(publicRole.id) : {}
  publicPermissionsCache = permissions
  lastCacheTime = now
  return permissions
}

// --- Session Management ---
export async function refreshUserSession(event: H3Event, userId: number) {
  const userData = await fetchUserWithPermissions(userId)
  if (!userData) {
    await clearUserSession(event)
    throw createError({ statusCode: 401, message: 'User not found' })
  }

  await setUserSession(event, {
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      role: userData.role,
      permissions: userData.permissions,
    },
  })
  return userData
}