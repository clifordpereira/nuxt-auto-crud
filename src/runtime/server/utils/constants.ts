export const PROTECTED_FIELDS = [
  'id', 
  'createdAt', 'updatedAt', 'deletedAt',
  'createdBy', 'updatedBy', 'deletedBy',
  'created_at', 'updated_at', 'deleted_at',
  'created_by', 'updated_by', 'deleted_by'
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
  // System Fields (Leakage prevention)
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deleted_at',
  'created_by',
  'updated_by'
]
