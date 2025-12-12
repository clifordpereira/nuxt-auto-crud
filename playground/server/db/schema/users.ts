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
})

export const usersRelations = relations(users, ({ one }) => ({
  assignedRole: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}))
