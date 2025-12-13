import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

let publicPermissionsCache: Record<string, string[]> | null = null
let lastCacheTime = 0
const CACHE_TTL = 60 * 1000 // 1 minute

export async function getPublicPermissions(): Promise<Record<string, string[]>> {
  const now = Date.now()
  if (publicPermissionsCache && (now - lastCacheTime < CACHE_TTL)) {
    return publicPermissionsCache
  }

  const publicRole = await db.select().from(schema.roles).where(eq(schema.roles.name, 'public')).get()

  if (!publicRole) {
    publicPermissionsCache = {}
    return {}
  }

  const permissionsData = await db.select({
    resource: schema.resources.name,
    action: schema.permissions.code,
  })
    .from(schema.roleResourcePermissions)
    .innerJoin(schema.resources, eq(schema.roleResourcePermissions.resourceId, schema.resources.id))
    .innerJoin(schema.permissions, eq(schema.roleResourcePermissions.permissionId, schema.permissions.id))
    .where(eq(schema.roleResourcePermissions.roleId, publicRole.id))
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
