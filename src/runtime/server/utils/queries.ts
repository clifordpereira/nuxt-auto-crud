import { useRuntimeConfig } from '#imports'
import { db } from '@nuxthub/db'
import { type Table, eq, desc, and, or, getColumns } from 'drizzle-orm'

import { getSelectableFields } from './modelMapper'

import { DeletionFailedError, InsertionFailedError, RecordNotFoundError, UpdationFailedError } from '../exceptions'

import type { QueryContext } from '../../types'
import type { TableWithId } from '../types'
import { pick } from '#nac/shared/utils/helpers'

/**
 * Fetches rows from the database based on the provided table and context.
 * @param table - The table to query.
 * @param context - The context object containing user ID and permissions.
 * @returns An array of rows from the database.
 */
export async function getRows(table: TableWithId, context: QueryContext = {}) {
  const { userId, permissions } = context

  const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || 'createdBy'
  const filters = []

  const ownerCol = table[ownerKey]
  const statusCol = table.status

  if (permissions?.includes('list')) {
    // Narrowing: ensure columns exist before use
    if (statusCol && ownerCol) {
      filters.push(
        or(
          eq(statusCol, 'active'),
          eq(ownerCol, Number(userId)),
        ),
      )
    }
    else if (statusCol) {
      filters.push(eq(statusCol, 'active'))
    }
  }
  else if (permissions?.includes('list_own') && userId && ownerCol) {
    filters.push(eq(ownerCol, Number(userId)))
  }

  const fields = getSelectableFields(table)
  let query = db.select(fields).from(table).$dynamic()
  if (filters.length > 0) query = query.where(and(...filters))

  return await query.orderBy(desc(table.id)).all()
}

/**
 * Fetches a single row from the database based on the provided table and ID.
 * @param table - The table to query.
 * @param id - The ID of the row to fetch.
 * @param context - The context object containing user ID and permissions.
 * @returns The row from the database.
 */
export async function getRow(table: TableWithId, id: string, context: QueryContext = {}) {
  const selectableFields = getSelectableFields(table)

  // If record exists in context, we still need to sanitize it before returning
  if (context.record) {
    return pick(context.record, Object.keys(selectableFields))
  }

  const record = await db.select(selectableFields).from(table).where(eq(table.id, Number(id))).get()
  if (!record) throw new RecordNotFoundError()

  return record
}

/**
 * Creates a new row in the database based on the provided table and data.
 * @param table - The table to query.
 * @param data - The data to insert into the table.
 * @param context - The context object containing user ID and permissions.
 */
export async function createRow(table: Table, data: Record<string, unknown>, context: QueryContext = {}) {
  const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || 'createdBy'

  const payload = { ...data }
  const allColumns = getColumns(table)
  const selectableFields = getSelectableFields(table)

  // Only inject if userId is provided and column exists in schema
  if (context.userId) {
    if (ownerKey in allColumns) payload[ownerKey] = Number(context.userId)
    if ('updatedBy' in allColumns) payload.updatedBy = Number(context.userId)
  }

  if ('updatedAt' in allColumns) {
    payload.updatedAt = new Date()
  }

  const result = await db.insert(table).values(payload).returning(selectableFields).get()
  if (!result) throw new InsertionFailedError()

  return result
}

/**
 * Updates a row in the database based on the provided table and ID.
 * @param table - The table to query.
 * @param id - The ID of the row to update.
 * @param data - The data to update in the table.
 * @param context - The context object containing user ID and permissions.
 */
export async function updateRow(table: TableWithId, id: string, data: Record<string, unknown>, context: QueryContext = {}) {
  const targetId = Number(id)
  const payload = { ...data }

  const allColumns = getColumns(table)
  const selectableFields = getSelectableFields(table)

  // Update audit metadata
  if (context.userId && 'updatedBy' in allColumns) {
    payload.updatedBy = Number(context.userId)
  }

  // Explicitly refresh updatedAt for SQLite
  if ('updatedAt' in allColumns) {
    payload.updatedAt = new Date()
  }

  const [updated] = await db.update(table).set(payload).where(eq(table.id, targetId)).returning(selectableFields)
  if (!updated) throw new UpdationFailedError()

  return updated
}

/**
 * Deletes a row from the database based on the provided table and ID.
 * @param table - The table to query.
 * @param id - The ID of the row to delete.
 */
export async function deleteRow(table: TableWithId, id: string) {
  const targetId = Number(id)
  const fields = getSelectableFields(table)

  const deletedRecord = await db.delete(table).where(eq(table.id, targetId)).returning(fields).get()
  if (!deletedRecord) throw new DeletionFailedError()

  return deletedRecord
}
