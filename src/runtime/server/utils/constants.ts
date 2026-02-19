/**
 * Full system audit and identity fields.
 * Should not be editable by users.
 */
const NAC_SYSTEM_FIELDS = [
  'id', 'uuid', 'created_at',
  'updated_at', 'deleted_at', 'created_by', 'updated_by',
]

/**
 * 1. API_HIDDEN_FIELDS
 * Strictly internal/sensitive data. Never leaves the server.
 */
export const NAC_API_HIDDEN_FIELDS = [
  'password', 'secret', 'token',
  'reset_token', 'reset_expires',
  'github_id', 'google_id',
]

/**
 * 2. FORM_HIDDEN_FIELDS
 * User should not edit these. System handles these.
 * Includes System Fields (minus status/updated_at) + Hidden Fields.
 */
export const NAC_FORM_HIDDEN_FIELDS = [
  // ...NAC_API_HIDDEN_FIELDS, // hidden by default.
  ...NAC_SYSTEM_FIELDS, // from the api, hide system fields too
]

/**
 * 3. TABLE_HIDDEN_FIELDS
 * UI clutter reduction for DataTables.
 */
export const NAC_DATA_TABLE_HIDDEN_FIELDS = [
  // ...NAC_API_HIDDEN_FIELDS, // hidden by default.
  'updated_at', 'deleted_at', 'created_by', 'updated_by', // from the api, hide these fields too
]

/** Tables used by the underlying database engine/migration tool */
export const NAC_SYSTEM_TABLES = ['_hub_migrations', 'd1_migrations', 'sqlite_sequence']
