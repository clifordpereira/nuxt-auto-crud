// server/api/[model]/index.get.ts
import { eventHandler, getRouterParams } from 'h3'
import { getTableForModel } from '../../utils/modelMapper'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { desc, getTableColumns, eq } from 'drizzle-orm'
import type { TableWithId } from '../../types'
import { ensureResourceAccess, formatResourceResult } from '../../utils/handler'

import { checkAdminAccess } from '../../utils/auth'

export default eventHandler(async (event) => {
  console.log('[GET] Request received', event.path)
  const { model } = getRouterParams(event) as { model: string }
  const isAdmin = await ensureResourceAccess(event, model, 'list')

  let canListAll = false
  try {
    canListAll = await checkAdminAccess(event, model, 'list_all')
  }
  catch {
    canListAll = false
  }

  const table = getTableForModel(model) as TableWithId
  const columns = getTableColumns(table)

  let query = db.select().from(table)

  // Filter active rows for non-admins (or those without list_all) if status field exists

  if (!canListAll && 'status' in columns) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = query.where(eq((table as any).status, 'active')) as any
  }

  const results = await query.orderBy(desc(table.id)).all()

  return results.map((item: Record<string, unknown>) => formatResourceResult(model, item, isAdmin))
})
