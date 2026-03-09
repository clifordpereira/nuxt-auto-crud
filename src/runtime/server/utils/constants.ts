/**
 * 1. API_HIDDEN_FIELDS
 * Strictly internal/sensitive data. Never leaves the server.
 */
export const NAC_API_HIDDEN_FIELDS = [
  'password', 'secret', 'token',
  'resetToken', 'resetExpires',
  'githubId', 'googleId',
]

/**
 * 2. FORM_HIDDEN_FIELDS
 */
export const NAC_FORM_HIDDEN_FIELDS = [
  ...NAC_API_HIDDEN_FIELDS,
  'id', 'uuid', 'createdAt',
  'updatedAt', 'deletedAt', 'createdBy', 'updatedBy',
]

/**
 * 3. DATA_TABLE_HIDDEN_FIELDS
 */
export const NAC_DATA_TABLE_HIDDEN_FIELDS = [
  'updatedAt', 'deletedAt', 'createdBy', 'updatedBy',
]

/**
 * 4. FORM_READ_ONLY_FIELDS
 * Visible in forms for context, but not editable.
 */
export const NAC_FORM_READ_ONLY_FIELDS = [] // id is managed in code as it should not be configurable accidently.

/**
 * Tables used by the engine.
 * These match the actual DB table names (usually snake_case or specific migration names).
 */
export const NAC_SYSTEM_TABLES = ['_hub_migrations', 'd1_migrations', 'sqlite_sequence']
