import { integer, text } from 'drizzle-orm/sqlite-core'

// 1. System Fields (Safe for almost every table)

export const systemFields = {
  id: integer('id').primaryKey({ autoIncrement: true }),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete
  createdBy: integer('created_by'), // Track who created this
  updatedBy: integer('updated_by'), // Track who last updated this
}

// 3. Base Fields (Common descriptive fields for entities)
export const baseFields = {
  name: text('name').notNull(),
  description: text('description'),
}
