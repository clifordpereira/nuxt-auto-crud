import { type Column, eq, or } from 'drizzle-orm'
import type { QueryObject } from 'h3'

import { useRuntimeConfig } from '#imports'

import type { NacQueryContext, NacCrudOperation } from '../../shared/utils/types'
import type { NacTableWithId } from '../types'

import { NAC_RESERVED_QUERY_KEYS } from './constants'

/* -------------------------------------------------------------------------- */
/*                                FILTERING                                   */
/* -------------------------------------------------------------------------- */

/** @internal */
export function coerceFilterValue(raw: string, col: Column): unknown {
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
 * @remarks plain-select branch
 * @internal
 */
export function getEqualityFilters(query: QueryObject, selectableFields: Record<string, Column>) {
  const filters = []
  for (const [key, rawValue] of Object.entries(query)) {
    if (NAC_RESERVED_QUERY_KEYS.has(key)) continue
    if (typeof rawValue !== 'string') continue // rejects arrays, null, undefined, objects, numbers, booleans — whatever this h3's QueryObject actually allows

    const col = selectableFields[key]
    if (!col) continue

    filters.push(eq(col, coerceFilterValue(rawValue, col)))
  }
  return filters
}

/**
 *
 * Resolves list-operation authorization filters: full bypass (list_all),
 * normal listing (list — combines with the status filter above), or
 * owner-restricted (list_own). When both statusFiltering and list_own
 * apply together, uses hybrid OR logic (active OR owned).
 *
 * @remarks (plain-select branch) Has a structural twin: nacResolveAuthorizationConditions in
 * query-conditions.ts implements identical branching logic for the RQB
 * shorthand form. Any change to the authorization rules here must be
 * mirrored there.
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
  if (resourcePermissions?.includes(operation)) return undefined

  if (resourcePermissions?.includes(`${operation}_own`) && userId != null) {
    const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || 'createdBy'
    const ownerCol = table[ownerKey]
    if (ownerCol) return eq(ownerCol, Number(userId))
  }
  return undefined
}
