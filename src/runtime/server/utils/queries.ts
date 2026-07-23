import { useRuntimeConfig } from '#imports'
import { type Table, type Column, eq, and, or, getColumns, desc } from 'drizzle-orm'
import type { QueryObject } from 'h3'

import { NacDeletionFailedError, NacInsertionFailedError, NacRecordNotFoundError, NacResourceNotFoundError, NacUnauthorizedAccessError, NacUpdateFailedError } from '../exceptions'
import { getSelectableFields, getModelExportKey } from './modelMapper'
import { resolveFieldList } from './field-resolution'
import { NAC_API_HIDDEN_FIELDS } from './constants'
import { nacResolvePagination } from './pagination'

import type { NacQueryContext } from '../../shared/utils/types'
import type { NacTableWithId } from '../types'
import { nacGetTableQueryConfig, getNacDb, isMysql, hasActiveRelations, nacGetTableName } from '#nac/db'

const NAC_RESERVED_QUERY_KEYS = new Set(['limit', 'offset', 'page'])

type NacCrudOperation = 'create' | 'read' | 'update' | 'delete'

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
  const hasFull = resourcePermissions.includes(operation)
  const hasOwn = operation !== 'create' && resourcePermissions.includes(`${operation}_own`)

  if (!hasFull && !hasOwn) throw new NacUnauthorizedAccessError()
}

/**
 * Resolves the ownership filter for read/update/delete. Returns undefined
 * when the caller has full access (no restriction needed) or when
 * authorization is disabled/public. Returns `eq(ownerCol, userId)` when
 * the caller only holds the '<op>_own' code.
 *
 * Contract: call nacRequireOperationPermission first — this function does
 * not itself reject a caller with neither code; it simply returns
 * undefined in that case, relying on the gate above to have already
 * thrown.
 *
 * @internal
 */
export function nacResolveOwnershipFilter(
  table: NacTableWithId,
  context: NacQueryContext = {},
  operation: Exclude<NacCrudOperation, 'create'>,
) {
  const isAuthorizationEnabled = useRuntimeConfig().autoCrud.auth?.authorization
  if (!isAuthorizationEnabled || context.isPublic) return undefined

  const { resourcePermissions = [], userId } = context
  if (resourcePermissions.includes(operation)) return undefined // full access

  if (resourcePermissions.includes(`${operation}_own`) && userId != null) {
    const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || 'createdBy'
    const ownerCol = table[ownerKey]
    if (ownerCol) return eq(ownerCol, Number(userId))
  }
  return undefined
}

/**
 * Config-driven default: restricts to `status = 'active'` when
 * `statusFiltering` is enabled and the table has a status column.
 * Independent of who's asking — this is a feature toggle, not an
 * authorization concern.
 *
 * @internal
 */
export function nacResolveStatusFilter(table: NacTableWithId) {
  const isStatusFilteringEnabled = useRuntimeConfig().autoCrud.statusFiltering
  if (!isStatusFilteringEnabled) return undefined
  const statusCol = table.status
  return statusCol ? eq(statusCol, 'active') : undefined
}

/**
 * Resolves list-operation authorization filters: full bypass (list_all),
 * normal listing (list — combines with the status filter above), or
 * owner-restricted (list_own). When both statusFiltering and list_own
 * apply together, uses hybrid OR logic (active OR owned).
 *
 * @internal
 */
export function nacResolveAuthorizationFilters(table: NacTableWithId, context: NacQueryContext = {}) {
  const isAuthorizationEnabled = useRuntimeConfig().autoCrud.auth?.authorization
  const isStatusFilteringEnabled = useRuntimeConfig().autoCrud.statusFiltering

  if (!isAuthorizationEnabled && !isStatusFilteringEnabled) return []

  const { userId, resourcePermissions = [] } = context

  if (isAuthorizationEnabled && resourcePermissions?.includes('list_all')) return []

  const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || 'createdBy'
  const ownerCol = table[ownerKey]
  const statusCol = table.status
  const filters = []

  if (isAuthorizationEnabled && isStatusFilteringEnabled) {
    if (resourcePermissions?.includes('list')) {
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
  else if (isStatusFilteringEnabled) {
    if (statusCol) filters.push(eq(statusCol, 'active'))
  }
  else if (isAuthorizationEnabled) {
    if (resourcePermissions?.includes('list_own') && ownerCol && userId != null) {
      filters.push(eq(ownerCol, Number(userId)))
    }
  }

  return filters
}

function hasAnyListPermissions(context: NacQueryContext = {}) {
  const { resourcePermissions = [] } = context
  return resourcePermissions?.includes('list_all') || resourcePermissions?.includes('list') || resourcePermissions?.includes('list_own')
}

/* -------------------------------------------------------------------------- */
/*                                FILTERING                                   */
/* -------------------------------------------------------------------------- */

/** @internal */
function coerceFilterValue(raw: string, col: Column): unknown {
  switch (col.dataType) {
    case 'number': {
      const n = Number(raw)
      return Number.isNaN(n) ? raw : n
    }
    case 'boolean':
      if (raw === 'true') return true
      if (raw === 'false') return false
      return raw
    default:
      return raw
  }
}

/**
 * Builds equality filters from raw query-string params, restricted to
 * fields the caller can actually see (post hidden-field / public-resource
 * narrowing) — never the full column set, so filtering can't be used to
 * infer a hidden field's value. Unrecognized or invisible keys are
 * silently ignored. `limit`/`offset`/`page` are reserved for pagination.
 *
 * @internal
 */
export function getEqualityFilters(query: QueryObject, selectableFields: Record<string, Column>) {
  const filters = []
  for (const [key, rawValue] of Object.entries(query)) {
    if (NAC_RESERVED_QUERY_KEYS.has(key)) continue
    if (Array.isArray(rawValue) || rawValue === undefined) continue

    const col = selectableFields[key]
    if (!col) continue

    filters.push(eq(col, coerceFilterValue(rawValue, col)))
  }
  return filters
}

/* -------------------------------------------------------------------------- */
/*                                   CRUD                                     */
/* -------------------------------------------------------------------------- */

/** @public */
export async function nacGetRows(table: NacTableWithId, context: NacQueryContext = {}, query: QueryObject = {}) {
  const isAuthorizationEnabled = useRuntimeConfig().autoCrud.auth?.authorization
  if (isAuthorizationEnabled && !context.isPublic && !hasAnyListPermissions(context)) {
    throw new NacUnauthorizedAccessError()
  }

  const exportKey = getModelExportKey(table)
  const fields = getSelectableFields(table, context)

  const filters = [
    ...nacResolveAuthorizationFilters(table, context),
    ...getEqualityFilters(query, fields),
  ]
  const { limit, offset } = nacResolvePagination(query)

  const queryOptions = exportKey ? (nacGetTableQueryConfig(exportKey) ?? {}) : {}

  const db = await getNacDb()
  const allColumns = getColumns(table)
  const hasIdColumn = 'id' in allColumns

  if (hasActiveRelations()) {
    if (!exportKey || !db.query[exportKey]) {
      throw new NacResourceNotFoundError(exportKey ?? 'unknown')
    }

    const { apiHiddenFields } = useRuntimeConfig().autoCrud
    const tableName = nacGetTableName(table)
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

    return await db.query[exportKey].findMany({
      ...(hasIdColumn && !queryOptions.orderBy ? { orderBy: { id: 'desc' } } : {}),
      ...queryOptions,
      columns: { ...columns, ...safeQueryColumns },
      limit,
      offset,
      ...(filters.length > 0 ? { where: and(...filters) } : {}),
    })
  }

  let dynamicQuery = db.select(fields).from(table).$dynamic()
  if (hasIdColumn) dynamicQuery = dynamicQuery.orderBy(desc(table.id))
  if (filters.length > 0) dynamicQuery = dynamicQuery.where(and(...filters))
  dynamicQuery = dynamicQuery.limit(limit).offset(offset)

  return await dynamicQuery.all()
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
