import type { NacFieldList } from '../types'

/**
 * Strictly internal/sensitive data fields that should never leave the server.
 *
 * @public
 */
export const NAC_API_HIDDEN_FIELDS = [
  // Sensitive fields (not needed in frontend)
  'password', 'secret', 'token', 'resetToken', 'resetExpires', 'githubId', 'googleId',
]

/**
 * Fields that are globally guarded (hidden/protected) by default.
 *
 * @public
 */
export const NAC_API_WRITE_PROTECTED_FIELDS = [
  // Default Id and timestamp fields (created automatically by system, not filled by client app)
  'id', 'uuid', 'createdAt', 'updatedAt', 'deletedAt', 'createdBy', 'updatedBy', 'deletedBy',
  // Sensitive fields (normally encrypted and inserted by third party apps/modules, not filled by client app)
  'password', 'secret', 'token', 'resetToken', 'resetExpires', 'githubId', 'googleId',
]

/**
 * Fields that are hidden from UI forms by default.
 *
 * @deprecated - configure at client side instead
 */
export const NAC_FORM_HIDDEN_FIELDS = []

/**
 * Fields that are visible in forms for context but remain non-editable.
 *
 * @deprecated - configure at client side instead
 */
export const NAC_FORM_READ_ONLY_FIELDS = []

/**
 * Table identifiers reserved for core system usage.
 *
 * @public
 */
export const NAC_SYSTEM_TABLES = ['_hub_migrations', 'd1_migrations', 'sqlite_sequence']

/**
 * Resolves a NacFieldList config (flat or per-resource) into a concrete Set
 * for a specific resource.
 */
export function resolveFieldList(
  config: NacFieldList,
  resourceName: string,
  builtInDefault: string[],
): Set<string> {
  if (Array.isArray(config)) return new Set(config)

  const base = config.default ?? builtInDefault
  const extra = config.resources?.[resourceName] ?? []
  return new Set([...base, ...extra])
}
