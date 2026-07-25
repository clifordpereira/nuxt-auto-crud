// third party imports
import { type Table, type SQL, sql, eq, lt, and, getColumns, desc, getTableName } from 'drizzle-orm'
import type { QueryObject } from 'h3'

// project imports
import { useRuntimeConfig } from '#imports'
import { nacGetTableQueryConfig, getNacDb, isMysql, hasActiveRelations } from '#nac/db'

// exceptions
import { NacDeletionFailedError, NacInsertionFailedError, NacRecordNotFoundError, NacResourceNotFoundError, NacUnauthorizedAccessError, NacUpdateFailedError } from '../exceptions'

// types
import type { NacPaginatedResponse, NacPaginationMeta, NacQueryContext, NacCrudOperation } from '../../shared/utils/types'
import type { NacTableWithId } from '../types'

// constants
import { NAC_API_HIDDEN_FIELDS } from './constants'

// utils
import { getSelectableFields, getModelExportKey } from './modelMapper'
import { resolveFieldList } from './field-resolution'
import { nacResolvePagination, nacResolveCursorPagination, nacSplitPage } from './pagination'
import { getEqualityFilters, nacResolveAuthorizationFilters, nacResolveOwnershipFilter } from './query-filters'
import { getEqualityConditions, nacResolveAuthorizationConditions, nacMergeRqbConditions } from './query-conditions'

/** @internal */
const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key]
    return acc
  }, {} as Pick<T, K>)
}

/* -------------------------------------------------------------------------- */
/*                              AUTHORIZATION                                 */
/* -------------------------------------------------------------------------- */

/**
 * Gate for create/read/update/delete. Throws NacUnauthorizedAccessError
 * unless the caller holds the operation's full-access code (e.g. 'update')
 * or its own-only code (e.g. 'update_own'). A no-op when authorization is
 * disabled or the request is on a public resource.
 *
 * @internal
 */
export function nacRequireOperationPermission(operation: NacCrudOperation, context: NacQueryContext = {}): void {
  const isAuthorizationEnabled = useRuntimeConfig().autoCrud.auth?.authorization
  if (!isAuthorizationEnabled || context.isPublic) return

  const { resourcePermissions = [] } = context
  const hasFull = resourcePermissions?.includes(operation)
  const hasOwn = operation !== 'create' && resourcePermissions?.includes(`${operation}_own`)

  if (!hasFull && !hasOwn) throw new NacUnauthorizedAccessError()
}

function hasAnyListPermissions(context: NacQueryContext = {}) {
  const { resourcePermissions = [] } = context
  return resourcePermissions?.includes('list_all') || resourcePermissions?.includes('list') || resourcePermissions?.includes('list_own')
}

/* -------------------------------------------------------------------------- */
/*                                   CRUD                                     */
/* -------------------------------------------------------------------------- */

/** @internal */
async function nacCountRows(table: NacTableWithId, filters: (SQL | undefined)[]): Promise<number> {
  const db = await getNacDb()
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(table).$dynamic()
  if (filters.length > 0) countQuery = countQuery.where(and(...filters))
  const row = isMysql() ? (await countQuery)[0] : await countQuery.get()
  return Number(row?.count ?? 0)
}

/**
 * post-update MySQL re-fetch below, where the caller was already
 * authorized for this exact row by the update that just succeeded.
 * @internal
 */
async function nacFetchRowByIdUnchecked(table: NacTableWithId, id: string, context: NacQueryContext = {}) {
  const selectableFields = getSelectableFields(table, context)
  const db = await getNacDb()
  const query = db.select(selectableFields).from(table).where(eq(table.id, Number(id)))
  const record = isMysql() ? (await query)[0] : await query.get()
  if (!record) throw new NacRecordNotFoundError()
  return record
}

/** @public */
export async function nacGetRows(
  table: NacTableWithId,
  context: NacQueryContext = {},
  query: QueryObject = {},
): Promise<NacPaginatedResponse<Record<string, unknown>>> {
  const isAuthorizationEnabled = useRuntimeConfig().autoCrud.auth?.authorization
  if (isAuthorizationEnabled && !context.isPublic && !hasAnyListPermissions(context)) {
    throw new NacUnauthorizedAccessError()
  }

  const exportKey = getModelExportKey(table)
  const fields = getSelectableFields(table, context)
  const allColumns = getColumns(table)
  const hasIdColumn = 'id' in allColumns

  const cursorPagination = hasIdColumn ? nacResolveCursorPagination(query) : null

  const filters = [
    ...nacResolveAuthorizationFilters(table, context),
    ...getEqualityFilters(query, fields),
  ]
  if (cursorPagination) filters.push(lt(table.id, cursorPagination.cursor))

  const { limit, offset } = cursorPagination
    ? { limit: cursorPagination.limit, offset: 0 }
    : nacResolvePagination(query)

  // Fetch one extra row past `limit` to detect hasMore without a second query.
  const fetchLimit = limit + 1

  const mode: NacPaginationMeta['mode'] = cursorPagination
    ? 'cursor'
    : (query.page !== undefined || query.offset !== undefined) ? 'offset' : 'simple'

  const queryOptions = exportKey ? (nacGetTableQueryConfig(exportKey) ?? {}) : {}
  const db = await getNacDb()

  let rows: Record<string, unknown>[]

  if (hasActiveRelations()) {
    if (!exportKey || !db.query[exportKey]) {
      throw new NacResourceNotFoundError(exportKey ?? 'unknown')
    }

    const { apiHiddenFields } = useRuntimeConfig().autoCrud
    const tableName = getTableName(table)
    const resourceKeys = exportKey ? [tableName, exportKey] : [tableName]
    const columnKeys = new Set(Object.keys(allColumns))
    const hiddenSet = resolveFieldList(apiHiddenFields, resourceKeys, NAC_API_HIDDEN_FIELDS, columnKeys)

    const columns = Object.keys(fields).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)

    const safeQueryColumns = Object.fromEntries(
      Object.entries(queryOptions.columns ?? {}).filter(([key]) => !hiddenSet.has(key)),
    )

    const rqbConditions = [
      ...nacResolveAuthorizationConditions(table, context),
      ...getEqualityConditions(query, fields),
    ]
    if (cursorPagination) rqbConditions.push({ id: { lt: cursorPagination.cursor } })
    const rqbWhere = nacMergeRqbConditions(rqbConditions)

    rows = await db.query[exportKey].findMany({
      ...(hasIdColumn && !queryOptions.orderBy ? { orderBy: { id: 'desc' } } : {}),
      ...queryOptions,
      columns: { ...columns, ...safeQueryColumns },
      limit: fetchLimit,
      ...(cursorPagination ? {} : { offset }),
      ...(rqbWhere ? { where: rqbWhere } : {}),
    })
  }
  else {
    let dynamicQuery = db.select(fields).from(table).$dynamic()
    if (hasIdColumn) dynamicQuery = dynamicQuery.orderBy(desc(table.id))
    if (filters.length > 0) dynamicQuery = dynamicQuery.where(and(...filters))
    dynamicQuery = dynamicQuery.limit(fetchLimit)
    if (!cursorPagination) dynamicQuery = dynamicQuery.offset(offset)

    rows = await dynamicQuery.all()
  }

  const { data, hasMore } = nacSplitPage(rows, limit)

  const meta: NacPaginationMeta = { mode, perPage: limit, hasMore }

  if (mode !== 'cursor') {
    meta.page = Math.floor(offset / limit) + 1
  }
  if (mode === 'cursor' && hasMore) {
    const lastRow = data[data.length - 1]
    if (lastRow && 'id' in lastRow) meta.nextCursor = String(lastRow.id)
  }
  if (query.total === 'true') {
    meta.total = await nacCountRows(table, filters)
  }

  return { data, meta }
}

/** @public */
export async function nacCreateRow(table: Table, data: Record<string, unknown>, context: NacQueryContext = {}) {
  nacRequireOperationPermission('create', context)

  const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || 'createdBy'

  const payload = { ...data }
  const allColumns = getColumns(table)
  const selectableFields = getSelectableFields(table, context)

  if (context.userId) {
    if (ownerKey in allColumns) payload[ownerKey] = Number(context.userId)
    if ('updatedBy' in allColumns) payload.updatedBy = Number(context.userId)
  }
  if ('updatedAt' in allColumns) payload.updatedAt = new Date()

  const db = await getNacDb()
  if (isMysql()) {
    const [res] = await db.insert(table).values(payload)
    if (!res.insertId) throw new NacInsertionFailedError()

    const rows = await db.select(selectableFields).from(table).where(eq((table as NacTableWithId).id, res.insertId))
    if (!rows[0]) throw new NacInsertionFailedError()
    return rows[0]
  }

  const result = await db.insert(table).values(payload).returning(selectableFields).get()
  if (!result) throw new NacInsertionFailedError()
  return result
}

/** @public */
export async function nacGetRow(table: NacTableWithId, id: string, context: NacQueryContext = {}) {
  nacRequireOperationPermission('read', context)

  const selectableFields = getSelectableFields(table, context)

  if (context.record) {
    return pick(context.record, Object.keys(selectableFields))
  }

  const ownershipFilter = nacResolveOwnershipFilter(table, context, 'read')
  const whereClause = ownershipFilter ? and(eq(table.id, Number(id)), ownershipFilter) : eq(table.id, Number(id))

  const db = await getNacDb()
  const query = db.select(selectableFields).from(table).where(whereClause)
  const record = isMysql() ? (await query)[0] : await query.get()
  if (!record) throw new NacRecordNotFoundError() // not-found, not forbidden — avoids confirming a not-owned row exists

  return record
}

/** @public */
export async function nacUpdateRow(table: NacTableWithId, id: string, data: Record<string, unknown>, context: NacQueryContext = {}) {
  nacRequireOperationPermission('update', context)

  const targetId = Number(id)
  const payload = { ...data }

  const allColumns = getColumns(table)
  const selectableFields = getSelectableFields(table, context)

  if (context.userId && 'updatedBy' in allColumns) payload.updatedBy = Number(context.userId)
  if ('updatedAt' in allColumns) payload.updatedAt = new Date()

  const ownershipFilter = nacResolveOwnershipFilter(table, context, 'update')
  const whereClause = ownershipFilter ? and(eq(table.id, targetId), ownershipFilter) : eq(table.id, targetId)

  const db = await getNacDb()
  if (isMysql()) {
    const [res] = await db.update(table).set(payload).where(whereClause)
    if (!res.affectedRows) {
      // A row scoped out by ownershipFilter and a genuinely missing id are
      // deliberately indistinguishable to the caller — both return 404,
      // never confirming a not-owned row's existence via status code.
      throw ownershipFilter ? new NacRecordNotFoundError() : new NacUpdateFailedError()
    }
    return await nacFetchRowByIdUnchecked(table, id, context)
  }

  const [updated] = await db.update(table).set(payload).where(whereClause).returning(selectableFields)
  if (!updated) {
    throw ownershipFilter ? new NacRecordNotFoundError() : new NacUpdateFailedError()
  }
  return updated
}

/** @public */
export async function nacDeleteRow(table: NacTableWithId, id: string, context: NacQueryContext = {}) {
  nacRequireOperationPermission('delete', context)

  const targetId = Number(id)
  const fields = getSelectableFields(table, context)

  const ownershipFilter = nacResolveOwnershipFilter(table, context, 'delete')
  const whereClause = ownershipFilter ? and(eq(table.id, targetId), ownershipFilter) : eq(table.id, targetId)

  const db = await getNacDb()
  if (isMysql()) {
    const recordToDelete = await nacGetRow(table, id, context)
    await db.delete(table).where(whereClause)
    return recordToDelete
  }

  const deletedRecord = await db.delete(table).where(whereClause).returning(fields).get()
  if (!deletedRecord) throw new NacDeletionFailedError()
  return deletedRecord
}
