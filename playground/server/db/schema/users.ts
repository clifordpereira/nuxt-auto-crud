import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { roles } from './permissions'
import { systemFields } from './utils'
import { relations } from 'drizzle-orm'

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

export const usersRelations = relations(users, ({ one }) => ({
  assignedRole: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  creator: one(users, {
    fields: [users.createdBy],
    references: [users.id],
    relationName: 'creator',
  }),
  updater: one(users, {
    fields: [users.updatedBy],
    references: [users.id],
    relationName: 'updater',
  }),
}))

export type User = typeof users.$inferSelect
