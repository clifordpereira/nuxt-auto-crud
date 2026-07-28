import type { NacAuthzSeedConfig } from '../../types/authz'

/**
 * Type-safe helper to define IAM (Identity and Access Management) seed configuration.
 *
 * This function is used at development time (usually in `server/config/permission-seed/authz.ts`)
 * to declare the roles, permissions, and resources for your application. It ensures
 * type safety.
 *
 * @example
 * ```typescript
 * import { defineAuthzSeed } from 'nuxt-auto-crud'
 *
 * export default defineAuthzSeed({
 *   roles: {
 *     admin: { permissions: 'all' },
 *     user: { permissions: ['read', 'update_own'] },
 *   },
 *   resources: ['posts', 'comments'],
 * })
 * ```
 *
 * @param config - The seed configuration object.
 * @returns The same configuration object, but with a validated type.
 *
 * @public
 */
export function defineAuthzSeed<const T extends NacAuthzSeedConfig>(config: T): T {
  return config
}
