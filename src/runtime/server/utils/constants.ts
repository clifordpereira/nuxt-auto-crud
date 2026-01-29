// server/utils/constants.ts
export const SYSTEM_USER_FIELDS = [
  'createdBy', 'created_by',
  'updatedBy', 'updated_by',
  'deletedBy', 'deleted_by',
]

export const PROTECTED_FIELDS = [
  'id',
  'createdAt', 'updatedAt', 'deletedAt',
  'created_at', 'updated_at', 'deleted_at',
  ...SYSTEM_USER_FIELDS,
]

export const HIDDEN_FIELDS = [
  // Sensitive Auth
  'password',
  'resetToken', 'reset_token',
  'resetExpires', 'reset_expires',
  'githubId', 'github_id',
  'googleId', 'google_id',
  'secret',
  'token',
  ...SYSTEM_USER_FIELDS,
]
