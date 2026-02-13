import type { H3Event } from 'h3'
import { createError } from 'h3'
import type { SQL } from 'drizzle-orm'
import type { User, AssignedRole } from '#auth-utils'
import type { TableWithId } from '#nac/types'

// --- Types ---
type DrizzleQueryHelpers = {
  eq: (column: unknown, value: unknown) => SQL
  and: (...filters: (SQL | undefined)[]) => SQL | undefined
}

// --- Cache State ---
let publicPermissionsCache: Record<string, string[]> | null = null
let lastCacheTime = 0
const CACHE_TTL = 60 * 1000

// --- Transformer ---
export function transformPermissions(
  resourcePermissions: {
    resource?: { name: string, status: string }
    permission?: { code: string, status: string }
  }[] = [],
): Record<string, string[]> {
  return resourcePermissions.reduce((acc, rp) => {
    const resource = rp.resource?.name
    const permission = rp.permission?.code
    if (resource && permission && rp.resource?.status === 'active' && rp.permission?.status === 'active') {
      acc[resource] ||= []
      acc[resource].push(permission)
    }
    return acc
  }, {} as Record<string, string[]>)
}

// --- Queries ---
export async function fetchPermissionsForRole(roleId: number | null) {
  if (!roleId) return {}
  const roleData = await db.query.roles.findFirst({
    where: (roles: TableWithId, { eq, and }: DrizzleQueryHelpers) => and(eq(roles.id, roleId), eq(roles.status, 'active')),
    with: {
      resourcePermissions: {
        where: (rp: TableWithId, { eq }: DrizzleQueryHelpers) => eq(rp.status, 'active'),
        with: {
          resource: { columns: { name: true, status: true } },
          permission: { columns: { code: true, status: true } },
        },
      },
    },
  })
  return transformPermissions(roleData?.resourcePermissions)
}

export async function fetchUserWithPermissions(userId: number): Promise<User | null> {
  const result = await db.query.users.findFirst({
    where: (users: TableWithId, { eq, and }: DrizzleQueryHelpers) => and(eq(users.id, userId), eq(users.status, 'active')),
    columns: { password: false },
    with: {
      assignedRole: {
        where: (roles: TableWithId, { eq }: DrizzleQueryHelpers) => eq(roles.status, 'active'),
        with: {
          resourcePermissions: {
            where: (rp: TableWithId, { eq }: DrizzleQueryHelpers) => eq(rp.status, 'active'),
            with: {
              resource: { columns: { name: true, status: true } },
              permission: { columns: { code: true, status: true } },
            },
          },
        },
      },
    },
  })

  if (!result) return null

  const userRecord = result as unknown as User & { assignedRole: AssignedRole | null }

  return {
    id: userRecord.id,
    uuid: userRecord.uuid,
    name: userRecord.name,
    email: userRecord.email,
    avatar: userRecord.avatar,
    role: userRecord.assignedRole?.name || 'user',
    permissions: transformPermissions(userRecord.assignedRole?.resourcePermissions),
  }
}

export async function getPublicPermissions(): Promise<Record<string, string[]>> {
  const now = Date.now()
  if (publicPermissionsCache && (now - lastCacheTime < CACHE_TTL)) return publicPermissionsCache

  const publicRole = await db.query.roles.findFirst({
    where: (roles: TableWithId, { eq, and }: DrizzleQueryHelpers) => and(eq(roles.name, 'public'), eq(roles.status, 'active')),
    columns: { id: true },
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
    throw createError({ statusCode: 401, message: 'User not found or inactive' })
  }

  await setUserSession(event, { user: userData })
  return userData
}
