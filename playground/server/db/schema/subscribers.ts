import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { systemFields } from './utils'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const subscribers = sqliteTable('subscribers', {
  ...systemFields,
  email: text('email').notNull().unique()
})

export const subscribersRelations = relations(subscribers, ({ one }) => ({
  creator: one(users, {
    fields: [subscribers.createdBy],
    references: [users.id],
    relationName: 'creator'
  }),
  updater: one(users, {
    fields: [subscribers.updatedBy],
    references: [users.id],
    relationName: 'updater'
  })
}))
