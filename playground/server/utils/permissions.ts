import { eq } from 'drizzle-orm'
import { tables, useDrizzle } from './drizzle'

let publicPermissionsCache: Record<string, string[]> | null = null
let lastCacheTime = 0
const CACHE_TTL = 60 * 1000 // 1 minute

export async function getPublicPermissions(): Promise<Record<string, string[]>> {
  const now = Date.now()
  if (publicPermissionsCache && (now - lastCacheTime < CACHE_TTL)) {
    return publicPermissionsCache
  }

  const db = useDrizzle()
  const publicRole = await db.select().from(tables.roles).where(eq(tables.roles.name, 'public')).get()

  if (!publicRole) {
    publicPermissionsCache = {}
    return {}
  }

  const permissionsData = await db.select({
    resource: tables.resources.name,
    action: tables.permissions.code
  })
  .from(tables.roleResourcePermissions)
  .innerJoin(tables.resources, eq(tables.roleResourcePermissions.resourceId, tables.resources.id))
  .innerJoin(tables.permissions, eq(tables.roleResourcePermissions.permissionId, tables.permissions.id))
  .where(eq(tables.roleResourcePermissions.roleId, publicRole.id))
  .all()

  const permissions: Record<string, string[]> = {}
  for (const p of permissionsData) {
    if (!permissions[p.resource]) {
      permissions[p.resource] = []
    }
    permissions[p.resource].push(p.action)
  }

  publicPermissionsCache = permissions
  lastCacheTime = now
  return permissions
}
