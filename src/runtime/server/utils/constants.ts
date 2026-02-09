// server/utils/constants.ts
// for Audit Trials
export const SYSTEM_USER_FIELDS = [
  // 'createdBy', 'created_by', // *_own permission requires createdBy
  'updatedBy', 'updated_by',
  'deletedBy', 'deleted_by',
]

// not intended to update
export const PROTECTED_FIELDS = [
  'id',
  'createdAt', 'updatedAt', 'deletedAt',
  'created_at', 'updated_at', 'deleted_at',
  ...SYSTEM_USER_FIELDS,
]

// hiden from api responses
export const HIDDEN_FIELDS = [
  // Sensitive Auth
  'uuid',
  'password',
  'resetToken', 'reset_token',
  'resetExpires', 'reset_expires',
  'githubId', 'github_id',
  'googleId', 'google_id',
  'secret',
  'token',
  ...SYSTEM_USER_FIELDS,
]
