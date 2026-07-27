import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as NacSchema from '#nac/schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function nacGetPermissionsForUser(
  db: DrizzleD1Database<any>,
  userId: number
): Promise<Record<string, string[]>> {
  const { users, roles, roleResourcePermissions, resources, permissions } = NacSchema

  const rows = await db
    .select({ resourceName: resources.name, permissionCode: permissions.code })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(roleResourcePermissions, eq(roleResourcePermissions.roleId, roles.id))
    .leftJoin(resources, eq(roleResourcePermissions.resourceId, resources.id))
    .leftJoin(permissions, eq(roleResourcePermissions.permissionId, permissions.id))
    .where(eq(users.id, userId))
    .all()

  return rows.reduce((acc, row) => {
    if (!row.resourceName || !row.permissionCode) return acc
    acc[row.resourceName] ??= []
    acc[row.resourceName].push(row.permissionCode)
    return acc
  }, {} as Record<string, string[]>)
}