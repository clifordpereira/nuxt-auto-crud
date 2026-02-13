import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { roles } from './roles-n-permissions'
import { systemFields } from './utils'

export const users = sqliteTable('users', {
  ...systemFields,
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  roleId: integer('role_id').references(() => roles.id),
  resetToken: text('reset_token'),
  resetExpires: integer('reset_expires'),
  githubId: text('github_id').unique(),
  googleId: text('google_id').unique(),
})
export type User = typeof users.$inferSelect
