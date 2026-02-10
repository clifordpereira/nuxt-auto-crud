import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { roles } from './roles-n-permissions'
import { systemFields, auditRelations } from './utils'
import { defineRelations } from 'drizzle-orm';

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
export const relations = defineRelations(schema, (r) => ({
  users: {
    assignedRole: r.one.roles({
      from: r.users.roleId,
      to: r.roles.id,
    }),
    
    // Spread Audit Relations
    // We pass 'r' which now contains the context of all tables
    ...auditRelations({
      ...r,
      tables: r.users // Scopes the 'from' fields to the users table
    }),
  },
}))
export type User = typeof users.$inferSelect
