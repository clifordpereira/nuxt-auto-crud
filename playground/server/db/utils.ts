import { integer, text, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
// import { uuidv7 } from 'uuidv7'

/**
 * System Fields
 *
 * System fields are used to store system information.
 */
export const auditFields = (userRef: () => AnySQLiteColumn) => ({
  // uuid: text('uuid').notNull().$defaultFn(() => uuidv7()), // Global Identifier [bun add uuidv7]
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  ...timestamps,
  ...ownership(userRef)
})

export const timestamps = {
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().$onUpdate(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}

export const ownership = (user: () => AnySQLiteColumn) => ({
  createdBy: integer('created_by').references(user, { onDelete: 'set null' }),
  updatedBy: integer('updated_by').references(user, { onDelete: 'set null' }),
})

/**
 * Base Fields
 *
 * Base fields are used to store common descriptive information.
 */
export const baseFields = {
  name: text('name').notNull(),
  description: text('description'),
}
