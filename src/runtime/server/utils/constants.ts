// src/runtime/utils/constants.ts

/**
 * Full system audit and identity fields.
 * Should not be editable by users.
 */
const NAC_SYSTEM_FIELDS = [
  'id', 'uuid',
  'created_at', 'updated_at', 'deleted_at', 
  'created_by', 'updated_by'
]

/**
 * 1. API_HIDDEN_FIELDS
 * Strictly internal/sensitive data. Never leaves the server.
 */
export const NAC_API_HIDDEN_FIELDS = [
  'password', 'secret', 'token',
  'reset_token', 'reset_expires',
  'github_id', 'google_id'
]

/**
 * 2. FORM_HIDDEN_FIELDS
 * User should not edit these. System handles these.
 * Includes System Fields (minus status/updated_at) + Hidden Fields.
 */
export const NAC_FORM_HIDDEN_FIELDS = [
  ...NAC_SYSTEM_FIELDS,
  ...NAC_API_HIDDEN_FIELDS
]

/**
 * 3. TABLE_HIDDEN_FIELDS
 * UI clutter reduction for DataTables.
 */
export const NAC_DATA_TABLE_HIDDEN_FIELDS = [
  'updated_at', 'deleted_at', 'created_by', 'updated_by'
]