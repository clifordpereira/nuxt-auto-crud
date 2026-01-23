// server/api/[model]/index.get.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventHandler, getRouterParams, createError } from 'h3'
import { getTableForModel } from '../../utils/modelMapper'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { desc, getTableColumns, eq, and, or } from 'drizzle-orm'
import type { TableWithId } from '../../types'
import { formatResourceResult } from '../../utils/handler'
// @ts-expect-error - #imports is a virtual alias
import { getUserSession } from '#imports'

import { checkAdminAccess } from '../../utils/auth'

export default eventHandler(async (event) => {
  console.log('[GET] Request received', event.path)
  const { model } = getRouterParams(event) as { model: string }
  let canListAny = false
  let canListAll = false
  let canListOwn = false

  // 1. Check permissions
  const [anyAccess, allAccess, ownAccess] = await Promise.all([
    checkAdminAccess(event, model, 'list').catch(() => false),
    checkAdminAccess(event, model, 'list_all').catch(() => false),
    checkAdminAccess(event, model, 'list_own').catch(() => false),
  ])

  canListAny = anyAccess
  canListAll = allAccess
  canListOwn = ownAccess

  if (!canListAny && !canListAll && !canListOwn) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const table = getTableForModel(model) as TableWithId
  const columns = getTableColumns(table)
  const session = await (getUserSession as any)(event)
  const userId = session?.user?.id

  let query = db.select().from(table)

  // 2. Build Filters
  const filters = []

  if (canListAll) {
    // No filters needed for List All
  }
  else if (canListAny && canListOwn && userId) {
    // Can see everyone's ACTIVE records OR OWN records (any status)
    const ownershipFilter = 'createdBy' in columns
      ? eq((table as any).createdBy, userId)
      : ('userId' in columns ? eq((table as any).userId, userId) : null)

    const activeFilter = 'status' in columns ? eq((table as any).status, 'active') : null

    if (ownershipFilter && activeFilter) {
      filters.push(or(activeFilter, ownershipFilter))
    }
    else if (activeFilter) {
      filters.push(activeFilter)
    }
    else if (ownershipFilter) {
      filters.push(ownershipFilter)
    }
  }
  else if (canListAny) {
    // Only Any: see everyone's ACTIVE records
    if ('status' in columns) {
      filters.push(eq((table as any).status, 'active'))
    }
  }
  else if (canListOwn && userId) {
    // Only Own: see ONLY own records (all statuses)
    if ('createdBy' in columns) {
      filters.push(eq((table as any).createdBy, userId))
    }
    else if ('userId' in columns) {
      filters.push(eq((table as any).userId, userId))
    }
  }

  if (filters.length > 0) {
    query = query.where(and(...filters)) as any
  }

  const isGuest = !userId // Result formatting control

  const results = await query.orderBy(desc(table.id)).all()

  return results.map((item: Record<string, unknown>) => formatResourceResult(model, item, isGuest))
})
