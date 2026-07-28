import type { RelationsBuilder, Table } from 'drizzle-orm'

/**
 * Schema shape `nacAuthzRelationsConfig` requires — the app's full schema
 * must contain at least these five tables (it may have more; extra app
 * tables like `posts` are allowed and ignored here).
 * @internal
 */
type NacAuthzRelationsSchema = Record<string, Table> & {
  roles: Table
  resources: Table
  permissions: Table
  roleResourcePermissions: Table
  users: Table
}

/**
 * Returns the relation definitions for NAC's authz tables, meant to be
 * spread into the app's own single `defineRelations()` call.
 *
 * @param r - The relations builder from the app's `defineRelations(schema, r => ({ ... }))`
 * callback. `TSchema` is inferred from whatever the app passes — no cast needed.
 * @public
 */
export function nacAuthzRelationsConfig<TSchema extends NacAuthzRelationsSchema>(
  r: RelationsBuilder<TSchema>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rb = r as any

  return {
    roles: {
      users: rb.many.users(),
      grants: rb.many.roleResourcePermissions(),
    },
    resources: {
      grants: rb.many.roleResourcePermissions(),
    },
    permissions: {
      grants: rb.many.roleResourcePermissions(),
    },
    roleResourcePermissions: {
      role: rb.one.roles({ from: rb.roleResourcePermissions.roleId, to: rb.roles.id }),
      resource: rb.one.resources({ from: rb.roleResourcePermissions.resourceId, to: rb.resources.id }),
      permission: rb.one.permissions({ from: rb.roleResourcePermissions.permissionId, to: rb.permissions.id }),
    },
    users: {
      role: rb.one.roles({ from: rb.users.roleId, to: rb.roles.id }),
    },
  }
}

/**
 * Query-config fragment for NAC's authz tables — mirrors the pattern
 * documented in the README's `nacTableQueryConfig` example. Spread into
 * the app's own `nacTableQueryConfig` export alongside their own tables.
 *
 * @example
 * ```ts
 * export const nacTableQueryConfig = {
 *   ...nacAuthzTableQueryConfig,
 *   posts: { with: { author: { columns: { name: true } } } },
 * }
 * ```
 * @public
 */
export const nacAuthzTableQueryConfig: Record<string, unknown> = {
  users: {
    with: {
      role: { columns: { name: true } },
    },
  },
  roleResourcePermissions: {
    with: {
      role: { columns: { name: true } },
      resource: { columns: { name: true } },
      permission: { columns: { code: true } },
    },
  },
}