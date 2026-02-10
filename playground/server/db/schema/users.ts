import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { roles } from './roles-n-permissions'
import { systemFields, auditRelations } from './utils'
import { relations } from 'drizzle-orm'

/**
 * Users
 * 
 * Users are used to store user information.
 */
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
export const usersRelations = relations(users, (helpers) => ({
  ...auditRelations(helpers, users, users), // Passes 'users' safely inside the callback
  assignedRole: helpers.one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}))
export type User = typeof users.$inferSelect
