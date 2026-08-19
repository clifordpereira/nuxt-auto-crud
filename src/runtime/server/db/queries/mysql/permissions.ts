import { eq } from 'drizzle-orm'
import type { MySql2Database } from 'drizzle-orm/mysql2'
import type { NacSchema } from '#nac/schema'

export async function nacGetPermissionsForUser(
  db: MySql2Database,
  schema: NacSchema,
  userId: number,
): Promise<Record<string, string[]>> {
  const { users, roles, roleResourcePermissions, resources, permissions } = schema

  const rows = await db
    .select({ resourceName: resources.name, permissionCode: permissions.code })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(roleResourcePermissions, eq(roleResourcePermissions.roleId, roles.id))
    .leftJoin(resources, eq(roleResourcePermissions.resourceId, resources.id))
    .leftJoin(permissions, eq(roleResourcePermissions.permissionId, permissions.id))
    .where(eq(users.id, userId))

  return rows.reduce((acc, row) => {
    if (!row.resourceName || !row.permissionCode) return acc
    acc[row.resourceName] ??= []
    acc[row.resourceName].push(row.permissionCode)
    return acc
  }, {} as Record<string, string[]>)
}
