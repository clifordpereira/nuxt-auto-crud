import { eq } from 'drizzle-orm'

import { NAC_PERMISSION_CODES } from './constants'
import type { NacAuthzSeedConfig, NacAuthzSchema } from '../../types/authz'
import type { NacTableWithId } from '../types'
import type { NacDb } from '#nac/db'

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

/** Minimal row shape returned by `.returning()` on an id-keyed insert. @internal */
interface NacSeedRow { id: number }

/** @internal */
interface NacNamedRow extends NacSeedRow { name: string }

/** @internal */
interface NacCodedRow extends NacSeedRow { code: string }

/** @public */
export interface NacSeedAuthzOptions {
  /** Live Drizzle database instance (already connected). */
  db: NacDb
  /** The consuming app's schema tables, matching {@link NacAuthzSchema}. */
  schema: NacAuthzSchema
  /** The authz seed definition — see `defineAuthzSeed`. */
  config: NacAuthzSeedConfig
  /** Password hasher supplied by the consuming app (e.g. from an auth module). */
  hashPassword: (raw: string) => Promise<string>
}

/** @internal */
interface NacBuildRolePermissionsOptions {
  config: NacAuthzSeedConfig
  seededRoles: NacNamedRow[]
  seededResources: NacNamedRow[]
  seededPermissions: NacCodedRow[]
}

/** @internal */
interface NacSeedUsersOptions extends NacSeedAuthzOptions {
  seededRoles: NacNamedRow[]
}

/* -------------------------------------------------------------------------- */
/*                                  DEFAULTS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Core resource names referenced by NAC's own IAM tables. Always seeded
 * alongside whatever app-specific resources the consumer lists in
 * `config.resources` — role configs commonly grant access to these
 * system tables themselves (e.g. a "useradmin" role managing `users`,
 * `roles`, `permissions`).
 * @public
 */
export const NAC_CORE_AUTHZ_RESOURCES = [
  'users', 'roles', 'permissions', 'resources', 'role_resource_permissions',
] as const

/* -------------------------------------------------------------------------- */
/*                                SEED STEPS                                  */
/* -------------------------------------------------------------------------- */

/** @internal */
async function seedPermissions({ db, schema }: NacSeedAuthzOptions): Promise<NacCodedRow[]> {
  return db
    .insert(schema.permissions)
    .values(NAC_PERMISSION_CODES.map(code => ({ code })))
    .returning()
}

/** @internal */
async function seedResources({ db, schema, config }: NacSeedAuthzOptions): Promise<NacNamedRow[]> {
  const names = [...new Set([...NAC_CORE_AUTHZ_RESOURCES, ...config.resources])]
  return db
    .insert(schema.resources)
    .values(names.map(name => ({ name })))
    .returning()
}

/** @internal */
async function seedRoles({ db, schema, config }: NacSeedAuthzOptions): Promise<NacNamedRow[]> {
  const entries = Object.entries(config.roles)
  return db
    .insert(schema.roles)
    .values(entries.map(([name, role]) => ({
      name,
      isSuperAdmin: role.isSuperAdmin ?? false,
    })))
    .returning()
}

/** @internal */
async function seedUsers({ db, schema, hashPassword, config, seededRoles }: NacSeedUsersOptions): Promise<NacSeedRow[]> {
  const roleMap = new Map(seededRoles.map(r => [r.name, r.id]))

  const users = await Promise.all(
    config.usersToSeed.map(async (user) => {
      const roleId = roleMap.get(user.role)
      if (roleId === undefined) {
        throw new Error(`[nuxt-auto-crud] usersToSeed references unknown role "${user.role}". Known roles: ${[...roleMap.keys()].join(', ')}.`)
      }

      return {
        name: user.name,
        email: user.email,
        password: await hashPassword(user.password),
        roleId,
      }
    }),
  )

  return db.insert(schema.users).values(users).returning()
}

/** @internal */
async function updateOwnerColumns(
  { db, schema }: NacSeedAuthzOptions,
  seededUsers: NacSeedRow[],
): Promise<void> {
  await Promise.all(
    seededUsers.map(user =>
      db
        .update(schema.users)
        .set({ createdBy: user.id, updatedBy: user.id })
        .where(eq((schema.users as NacTableWithId).id, user.id)),
    ),
  )
}

/* -------------------------------------------------------------------------- */
/*                            ROLE → PERMISSION GRID                          */
/* -------------------------------------------------------------------------- */

/**
 * Expands `config.roles` into `role_resource_permissions` rows, resolving
 * role/resource/permission names to their seeded database ids and
 * expanding any preset names (`config.presets`) into their concrete codes.
 * @public
 */
export function buildRolePermissions({
  config,
  seededRoles,
  seededResources,
  seededPermissions,
}: NacBuildRolePermissionsOptions): { roleId: number, resourceId: number, permissionId: number }[] {
  const presets = config.presets ?? {}

  const roleMap = new Map(seededRoles.map(r => [r.name, r.id]))
  const resourceMap = new Map(seededResources.map(r => [r.name, r.id]))
  const permissionMap = new Map(seededPermissions.map(p => [p.code, p.id]))

  const result: { roleId: number, resourceId: number, permissionId: number }[] = []

  for (const [roleName, role] of Object.entries(config.roles)) {
    const roleId = roleMap.get(roleName)
    if (roleId === undefined) continue

    if (role.isSuperAdmin) {
      for (const resource of seededResources) {
        for (const permission of seededPermissions) {
          result.push({ roleId, resourceId: resource.id, permissionId: permission.id })
        }
      }
      continue
    }

    for (const [resourceName, codes] of Object.entries(role.permissions ?? {})) {
      const resourceId = resourceMap.get(resourceName)
      if (resourceId === undefined) continue

      const codeList = Array.isArray(codes) ? codes : [codes]
      const expanded = codeList.flatMap(code => presets[code] ?? [code])

      for (const code of expanded) {
        const permissionId = permissionMap.get(code)
        if (permissionId !== undefined) {
          result.push({ roleId, resourceId, permissionId })
        }
      }
    }
  }

  return result
}

/* -------------------------------------------------------------------------- */
/*                                ORCHESTRATOR                                */
/* -------------------------------------------------------------------------- */

/**
 * Seeds the full authz graph — permissions, resources, roles, one user
 * per role, and the resolved role→resource→permission grid — from a
 * `defineAuthzSeed` config.
 * @public
 */
export async function nacSeedAuthz(options: NacSeedAuthzOptions) {
  // validate role config
  for (const [roleName, role] of Object.entries(options.config.roles)) {
    const r = role as { isSuperAdmin?: boolean, permissions?: unknown }
    if (r.isSuperAdmin && r.permissions !== undefined) {
      throw new Error(
        `[nuxt-auto-crud] Role "${roleName}" sets both isSuperAdmin and permissions. `
        + `A superadmin role's grid is derived automatically — remove "permissions" from this role.`,
      )
    }
    if (!r.isSuperAdmin && r.permissions === undefined) {
      throw new Error(
        `[nuxt-auto-crud] Role "${roleName}" must set either isSuperAdmin: true or a permissions map.`,
      )
    }
  }

  const [seededPermissions, seededResources, seededRoles] = await Promise.all([
    seedPermissions(options),
    seedResources(options),
    seedRoles(options),
  ])

  const seededUsers = await seedUsers({ ...options, seededRoles })
  await updateOwnerColumns(options, seededUsers)

  const rolePermissions = buildRolePermissions({
    config: options.config,
    seededRoles,
    seededResources,
    seededPermissions,
  })

  if (rolePermissions.length > 0) {
    await options.db.insert(options.schema.roleResourcePermissions).values(rolePermissions)
  }

  return { seededPermissions, seededResources, seededRoles, seededUsers }
}
