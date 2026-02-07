import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { fetchPermissionsForRole } from './auth'

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

  // Reuse shared permission fetching logic
  const permissions = await fetchPermissionsForRole(publicRole.id)

  publicPermissionsCache = permissions
  lastCacheTime = now
  return permissions
}
