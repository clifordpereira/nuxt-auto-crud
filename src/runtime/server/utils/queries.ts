import { useRuntimeConfig } from '#imports'
import { db, type NuxtHubRuntimeConfig } from '@nuxthub/db'
import { type Table, eq, desc, and, or, getColumns } from 'drizzle-orm'

import { getSelectableFields } from './modelMapper'

import { DeletionFailedError, InsertionFailedError, RecordNotFoundError, UnauthorizedAccessError, UpdateFailedError } from '../exceptions'

import type { QueryContext } from '../../types'
import type { TableWithId } from '../types'
import { pick } from '#nac/shared/utils/helpers'

// helper used in this file
function isMysql() {
  const hub = (useRuntimeConfig() as unknown as NuxtHubRuntimeConfig).hub
  const dbConfig = hub?.db
  return dbConfig === 'mysql' || (typeof dbConfig === 'object' && dbConfig?.dialect === 'mysql')
}

// helper used in nacGetRows
export function getVisibilityFilters(table: TableWithId, context: QueryContext = {}) {
  const isAuthorizationEnabled = useRuntimeConfig().autoCrud.auth?.authorization
  const isStatusFilteringEnabled = useRuntimeConfig().autoCrud.statusFiltering

  if (!isAuthorizationEnabled && !isStatusFilteringEnabled) return []

  const { userId, resourcePermissions = [] } = context

  // 1. Full Access Bypass
  if (isAuthorizationEnabled && resourcePermissions?.includes('list_all')) return []

  const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || 'createdBy'
  const ownerCol = table[ownerKey]
  const statusCol = table.status
  const filters = []

  // 2. Hybrid Logic (Auth + Status)
  if (isAuthorizationEnabled && isStatusFilteringEnabled) {
    if (resourcePermissions?.includes('list_active')) {
      if (statusCol && ownerCol && userId != null) {
        filters.push(or(eq(statusCol, 'active'), eq(ownerCol, Number(userId))))
      }
      else if (statusCol) {
        filters.push(eq(statusCol, 'active'))
      }
    }
    else if (resourcePermissions?.includes('list_own') && ownerCol && userId != null) {
      filters.push(eq(ownerCol, Number(userId)))
    }
  }
  // 3. Status Only Logic
  else if (isStatusFilteringEnabled) {
    if (statusCol) filters.push(eq(statusCol, 'active'))
  }
  // 4. Authorization Only Logic
  else if (isAuthorizationEnabled) {
    if (resourcePermissions?.includes('list_own') && ownerCol && userId != null) {
      filters.push(eq(ownerCol, Number(userId)))
    }
  }

  return filters
}

// helper used in nacGetRows
function hasAnyListPermissions(context: QueryContext = {}) {
  const { resourcePermissions = [] } = context
  return resourcePermissions?.includes('list_all') || resourcePermissions?.includes('list_active') || resourcePermissions?.includes('list_own')
}

/**
 * Fetches rows from the database based on the provided table and context.
 * @param table - The table to query.
 * @param context - The context object containing user ID and resourcePermissions.
 * @returns An array of rows from the database.
 */
export async function nacGetRows(table: TableWithId, context: QueryContext = {}) {
  const isAuthorizationEnabled = useRuntimeConfig().autoCrud.auth?.authorization
  if (isAuthorizationEnabled && !context.isPublic && !hasAnyListPermissions(context)) {
    throw new UnauthorizedAccessError()
  }

  const fields = getSelectableFields(table, context)
  let query = db.select(fields).from(table).$dynamic()

  const filters = getVisibilityFilters(table, context)
  if (filters.length > 0) query = query.where(and(...filters))

  const baseQuery = query.orderBy(desc(table.id))
  if (isMysql()) {
    return await baseQuery
  }
  return await baseQuery.all()
}

/**
 * Fetches a single row from the database based on the provided table and ID.
 * @param table - The table to query.
 * @param id - The ID of the row to fetch.
 * @param context - The context object containing user ID and resourcePermissions.
 * @returns The row from the database.
 */
export async function nacGetRow(table: TableWithId, id: string, context: QueryContext = {}) {
  const selectableFields = getSelectableFields(table, context)

  // If record exists in context, we still need to sanitize it before returning
  if (context.record) {
    return pick(context.record, Object.keys(selectableFields))
  }

  const query = db.select(selectableFields).from(table).where(eq(table.id, Number(id)))
  const record = isMysql() ? (await query)[0] : await query.get()
  if (!record) throw new RecordNotFoundError()

  return record
}

/**
 * Creates a new row in the database based on the provided table and data.
 * @param table - The table to query.
 * @param data - The data to insert into the table.
 * @param context - The context object containing user ID and resourcePermissions.
 */
export async function nacCreateRow(table: Table, data: Record<string, unknown>, context: QueryContext = {}) {
  const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || 'createdBy'

  const payload = { ...data }
  const allColumns = getColumns(table)
  const selectableFields = getSelectableFields(table, context)

  // Only inject if userId is provided and column exists in schema
  if (context.userId) {
    if (ownerKey in allColumns) payload[ownerKey] = Number(context.userId)
    if ('updatedBy' in allColumns) payload.updatedBy = Number(context.userId)
  }

  if ('updatedAt' in allColumns) {
    payload.updatedAt = new Date()
  }

  if (isMysql()) {
    const [res] = await db.insert(table).values(payload)
    // Fetch manually to simulate .returning()
    const rows = await db.select(selectableFields)
      .from(table)
      .where(eq((table as TableWithId).id, res.insertId))

    return rows[0]
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
 * @param context - The context object containing user ID and resourcePermissions.
 */
export async function nacUpdateRow(table: TableWithId, id: string, data: Record<string, unknown>, context: QueryContext = {}) {
  const targetId = Number(id)
  const payload = { ...data }

  const allColumns = getColumns(table)
  const selectableFields = getSelectableFields(table, context)

  // Update audit metadata
  if (context.userId && 'updatedBy' in allColumns) {
    payload.updatedBy = Number(context.userId)
  }

  // Explicitly refresh updatedAt for SQLite
  if ('updatedAt' in allColumns) {
    payload.updatedAt = new Date()
  }

  if (isMysql()) {
    await db.update(table).set(payload).where(eq(table.id, targetId))
    return await nacGetRow(table, id, context) // Reuse existing fetch logic
  }

  const [updated] = await db.update(table).set(payload).where(eq(table.id, targetId)).returning(selectableFields)
  if (!updated) throw new UpdateFailedError()

  return updated
}

/**
 * Deletes a row from the database based on the provided table and ID.
 * @param table - The table to query.
 * @param id - The ID of the row to delete.
 */
export async function nacDeleteRow(table: TableWithId, id: string) {
  const targetId = Number(id)
  const fields = getSelectableFields(table)

  if (isMysql()) {
    const recordToDelete = await nacGetRow(table, id)
    await db.delete(table).where(eq(table.id, targetId))
    return recordToDelete
  }

  const deletedRecord = await db.delete(table).where(eq(table.id, targetId)).returning(fields).get()
  if (!deletedRecord) throw new DeletionFailedError()

  return deletedRecord
}
