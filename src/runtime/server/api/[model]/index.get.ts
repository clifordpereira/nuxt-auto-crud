// server/api/[model]/index.get.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventHandler, getRouterParams } from 'h3'
import { getTableForModel, formatResourceResult } from '../../utils/modelMapper'
import { ensureResourceAccess } from '../../utils/guard'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { desc } from 'drizzle-orm'
import type { TableWithId } from '../../types'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }

  await ensureResourceAccess(event, model, 'read')
  
  const table = getTableForModel(model) as TableWithId
  const query = db.select().from(table)
  const results = await query.orderBy(desc(table.id)).all()

  const isGuest = event.context.isGuest ?? false

  return results.map((item: Record<string, unknown>) => formatResourceResult(model, item, isGuest))
})
