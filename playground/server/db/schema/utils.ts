import { integer, text } from 'drizzle-orm/sqlite-core'
import { uuidv7 } from 'uuidv7'

/**
 * System Fields
 * 
 * System fields are used to store system information.
 */
export const systemFields = {
  id: integer('id').primaryKey({ autoIncrement: true }), // Local DB for speed
  uuid: text('uuid').notNull().$defaultFn(() => uuidv7()), // Global Identifier [bun add uuidv7]
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete
  createdBy: integer('created_by'), // Track who created this
  updatedBy: integer('updated_by'), // Track who last updated this
}

/**
 * Base Fields
 * 
 * Base fields are used to store common descriptive information.
 */
export const baseFields = {
  name: text('name').notNull(),
  description: text('description'),
}
