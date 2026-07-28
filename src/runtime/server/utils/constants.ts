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
 * The full set of permission codes NAC's authorization layer understands.
 * Matches the `<op>` / `<op>_own` pattern for create/read/update/delete,
 * plus the three list-specific codes (list_all/list/list_own).
 * @public
 */
export const NAC_PERMISSION_CODES = [
  'list_all', 'list', 'list_own',
  'create',
  'read', 'read_own',
  'update', 'update_own',
  'delete', 'delete_own',
] as const

export type NacPermissionCode = typeof NAC_PERMISSION_CODES[number]

export const NAC_RESERVED_QUERY_KEYS = new Set(['limit', 'offset', 'page', 'cursor', 'total'])

/**
 * NAC's own system route segments — not real CRUD resources, so they
 * should never be resolved as a `:model` name by nacGetModelFromPath.
 * Consuming apps' own permission middleware relies on this: a `null`
 * result means "not a data route," matching the early-return pattern
 * already used for non-NAC paths.
 *
 * @public
 */
export const NAC_RESERVED_ROUTE_SEGMENTS = new Set(['_schemas', '_meta', '_sse'])
