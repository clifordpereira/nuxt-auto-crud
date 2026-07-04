import { useRuntimeConfig } from '#imports'
import { type Table, eq, and, or, getColumns, desc } from 'drizzle-orm'

import { NacDeletionFailedError, NacInsertionFailedError, NacRecordNotFoundError, NacUnauthorizedAccessError, NacUpdateFailedError } from '../exceptions'
import { getSelectableFields } from './modelMapper'

import type { NacQueryContext } from '../../shared/utils/types'
import type { NacTableWithId } from '../types'
import { nacGetTableName, nacGetTableQueryConfig, useNacDb, isMysql } from './db'


/**
 * Picks only the specified keys from an object.
 *
 * @param obj - The object to pick keys from.
 * @param keys - The keys to pick.
 * @returns An object with only the specified keys.
 * @internal
 */
const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key]
    return acc
  }, {} as Pick<T, K>)
}

/**
 * Get visibility filters for a table.
 *
 * @param table - The table to get visibility filters for.
 * @param context - The context to get visibility filters for.
 * @returns An array of visibility filters for the table.
 * @internal
 */
export function getVisibilityFilters(table: NacTableWithId, context: NacQueryContext = {}) {
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
function hasAnyListPermissions(context: NacQueryContext = {}) {
  const { resourcePermissions = [] } = context
  return resourcePermissions?.includes('list_all') || resourcePermissions?.includes('list_active') || resourcePermissions?.includes('list_own')
}

/**
 * Fetches rows from the database based on the provided table and context.
 *
 * @param table - The table to query.
 * @param context - The context object containing user ID and resourcePermissions.
 * @returns An array of rows from the database.
 * @public
 */
export async function nacGetRows(table: NacTableWithId, context: NacQueryContext = {}) {
  const isAuthorizationEnabled = useRuntimeConfig().autoCrud.auth?.authorization
  if (isAuthorizationEnabled && !context.isPublic && !hasAnyListPermissions(context)) {
    throw new NacUnauthorizedAccessError()
  }

  const tableName = await nacGetTableName(table)
  const filters = getVisibilityFilters(table, context)
  const queryOptions = nacGetTableQueryConfig(tableName)

  const db = await useNacDb()
  const hasRelations = Object.keys(db._.relations).length > 0
  
  if (hasRelations) {
    return await db.query[tableName].findMany({
      orderBy: { id: 'desc' },
      ...queryOptions,
      where: filters.length > 0 ? and(...filters) : undefined,
    })
  }

  return db
    .select()
    .from(table)
    .orderBy(desc(table.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
}

/**
 * Fetches a single row from the database based on the provided table and ID.
 *
 * @param table - The table to query.
 * @param id - The ID of the row to fetch.
 * @param context - The context object containing user ID and resourcePermissions.
 * @returns The row from the database.
 * @public
 */
export async function nacGetRow(table: NacTableWithId, id: string, context: NacQueryContext = {}) {
  const selectableFields = getSelectableFields(table, context)

  // If record exists in context, we still need to sanitize it before returning
  if (context.record) {
    return pick(context.record, Object.keys(selectableFields))
  }

  const db = await useNacDb()
  const query = db.select(selectableFields).from(table).where(eq(table.id, Number(id)))
  const record = isMysql() ? (await query)[0] : await query.get()
  if (!record) throw new NacRecordNotFoundError()

  return record
}

/**
 * Creates a new row in the database based on the provided table and data.
 *
 * @param table - The table to query.
 * @param data - The data to insert into the table.
 * @param context - The context object containing user ID and resourcePermissions.
 * @returns The created record.
 * @public
 */
export async function nacCreateRow(table: Table, data: Record<string, unknown>, context: NacQueryContext = {}) {
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

  const db = await useNacDb()
  if (isMysql()) {
    const [res] = await db.insert(table).values(payload)
    // Fetch manually to simulate .returning()
    const rows = await db.select(selectableFields)
      .from(table)
      .where(eq((table as NacTableWithId).id, res.insertId))

    return rows[0]
  }

  const result = await db.insert(table).values(payload).returning(selectableFields).get()
  if (!result) throw new NacInsertionFailedError()

  return result
}

/**
 * Updates a row in the database based on the provided table and ID.
 *
 * @param table - The table to query.
 * @param id - The ID of the row to update.
 * @param data - The data to update in the table.
 * @param context - The context object containing user ID and resourcePermissions.
 * @returns The updated record.
 * @public
 */
export async function nacUpdateRow(table: NacTableWithId, id: string, data: Record<string, unknown>, context: NacQueryContext = {}) {
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

  const db = await useNacDb()
  if (isMysql()) {
    await db.update(table).set(payload).where(eq(table.id, targetId))
    return await nacGetRow(table, id, context) // Reuse existing fetch logic
  }

  const [updated] = await db.update(table).set(payload).where(eq(table.id, targetId)).returning(selectableFields)
  if (!updated) throw new NacUpdateFailedError()

  return updated
}

/**
 * Deletes a row from the database based on the provided table and ID.
 *
 * @param table - The table to query.
 * @param id - The ID of the row to delete.
 * @returns The deleted record data.
 * @public
 */
export async function nacDeleteRow(table: NacTableWithId, id: string) {
  const targetId = Number(id)
  const fields = getSelectableFields(table)

  const db = await useNacDb()
  if (isMysql()) {
    const recordToDelete = await nacGetRow(table, id)
    await db.delete(table).where(eq(table.id, targetId))
    return recordToDelete
  }

  const deletedRecord = await db.delete(table).where(eq(table.id, targetId)).returning(fields).get()
  if (!deletedRecord) throw new NacDeletionFailedError()

  return deletedRecord
}

