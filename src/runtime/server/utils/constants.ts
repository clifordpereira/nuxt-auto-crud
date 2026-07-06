/**
 * Strictly internal/sensitive data fields that should never leave the server.
 *
 * @public
 */
export const NAC_API_HIDDEN_FIELDS = [
  'password', 'secret', 'token',
  'resetToken', 'resetExpires',
  'githubId', 'googleId',
]

/**
 * Fields that are hidden from UI forms by default.
 *
 * @public
 */
export const NAC_FORM_HIDDEN_FIELDS = [
  ...NAC_API_HIDDEN_FIELDS,
  'id', 'uuid', 'createdAt',
  'updatedAt', 'deletedAt', 'createdBy', 'updatedBy',
]

/**
 * Fields that are hidden from data tables by default.
 *
 * @public
 */
export const NAC_DATA_TABLE_HIDDEN_FIELDS = [
  'updatedAt', 'deletedAt', 'createdBy', 'updatedBy',
]

/**
 * Fields that are visible in forms for context but remain non-editable.
 *
 * @public
 */
export const NAC_FORM_READ_ONLY_FIELDS = [] // id is managed in code as it should not be configurable accidently.

/**
 * Table identifiers reserved for core system usage.
 *
 * @public
 */
export const NAC_SYSTEM_TABLES = ['_hub_migrations', 'd1_migrations', 'sqlite_sequence']
