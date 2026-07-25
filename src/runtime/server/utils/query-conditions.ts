import { type Column, getColumns } from 'drizzle-orm'
import type { QueryObject } from 'h3'

import { useRuntimeConfig } from '#imports'

import type { NacQueryContext } from '../../shared/utils/types'
import type { NacTableWithId } from '../types'

import { NAC_RESERVED_QUERY_KEYS } from './constants'

import { coerceFilterValue } from './query-filters'

type NacRqbCondition = Record<string, unknown>

/** @internal — merges RQB shorthand conditions; same-column conditions merge their operator objects instead of overwriting */
export function nacMergeRqbConditions(conditions: NacRqbCondition[]): NacRqbCondition | undefined {
  if (conditions.length === 0) return undefined
  const merged: NacRqbCondition = {}
  for (const cond of conditions) {
    for (const [key, value] of Object.entries(cond)) {
      if (key in merged && typeof merged[key] === 'object' && typeof value === 'object') {
        merged[key] = { ...(merged[key] as object), ...(value as object) }
      }
      else {
        merged[key] = value
      }
    }
  }
  return merged
}

/**
 * RQB-shorthand equivalent of nacResolveAuthorizationFilters — same
 * branching logic, but emits conditions keyed by column name for
 * db.query[x].findMany()'s own `where`, instead of SQL built against the
 * unaliased table object (which breaks under RQB's internal aliasing).
 * 
 * @remarks Has a structural twin: nacResolveAuthorizationFilters in
 * query-filters.ts implements identical branching logic for the RQB
 * shorthand form. Any change to the authorization rules here must be
 * mirrored there.
 * @internal
 */
export function nacResolveAuthorizationConditions(table: NacTableWithId, context: NacQueryContext = {}): NacRqbCondition[] {
  const isAuthorizationEnabled = useRuntimeConfig().autoCrud.auth?.authorization
  const isStatusFilteringEnabled = useRuntimeConfig().autoCrud.statusFiltering

  if (!isAuthorizationEnabled && !isStatusFilteringEnabled) return []

  const { userId, resourcePermissions = [] } = context
  if (isAuthorizationEnabled && resourcePermissions?.includes('list_all')) return []

  const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || 'createdBy'
  const allColumns = getColumns(table)
  const hasOwnerCol = ownerKey in allColumns
  const hasStatusCol = 'status' in allColumns
  const conditions: NacRqbCondition[] = []

  if (isAuthorizationEnabled && isStatusFilteringEnabled) {
    if (resourcePermissions?.includes('list')) {
      if (hasStatusCol && hasOwnerCol && userId != null) {
        conditions.push({ OR: [{ status: { eq: 'active' } }, { [ownerKey]: { eq: Number(userId) } }] })
      }
      else if (hasStatusCol) {
        conditions.push({ status: { eq: 'active' } })
      }
    }
    else if (resourcePermissions?.includes('list_own') && hasOwnerCol && userId != null) {
      conditions.push({ [ownerKey]: { eq: Number(userId) } })
    }
  }
  else if (isStatusFilteringEnabled) {
    if (hasStatusCol) conditions.push({ status: { eq: 'active' } })
  }
  else if (isAuthorizationEnabled) {
    if (resourcePermissions?.includes('list_own') && hasOwnerCol && userId != null) {
      conditions.push({ [ownerKey]: { eq: Number(userId) } })
    }
  }

  return conditions
}

/** RQB-shorthand equivalent of getEqualityFilters. @internal */
export function getEqualityConditions(query: QueryObject, selectableFields: Record<string, Column>): NacRqbCondition[] {
  const conditions: NacRqbCondition[] = []
  for (const [key, rawValue] of Object.entries(query)) {
    if (NAC_RESERVED_QUERY_KEYS.has(key)) continue
    if (typeof rawValue !== 'string') continue // rejects arrays, null, undefined, objects, numbers, booleans — whatever this h3's QueryObject actually allows
    const col = selectableFields[key]
    if (!col) continue
    conditions.push({ [key]: { eq: coerceFilterValue(rawValue, col) } })
  }
  return conditions
}