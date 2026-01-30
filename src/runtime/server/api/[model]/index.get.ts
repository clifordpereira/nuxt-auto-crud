// server/api/[model]/index.get.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventHandler, getRouterParams } from 'h3'
import { getTableForModel } from '../../utils/modelMapper'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { desc, getTableColumns } from 'drizzle-orm'
import type { TableWithId } from '../../types'
import { formatResourceResult } from '../../utils/handler'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }
  
  const table = getTableForModel(model) as TableWithId

  const query = db.select().from(table)

  const isGuest = event.context.isGuest ?? false

  const results = await query.orderBy(desc(table.id)).all()

  return results.map((item: Record<string, unknown>) => formatResourceResult(model, item, isGuest))
})
