// server/api/_nac/[model]/index.get.ts

import { eventHandler, getRouterParams } from 'h3'
import { getTableForModel, formatResourceResult } from '../../../utils/modelMapper'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { desc } from 'drizzle-orm'
import type { TableWithId } from '../../../types'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }

  const table = getTableForModel(model) as TableWithId
  const query = db.select().from(table)
  const results = await query.orderBy(desc(table.id)).all()

  return formatResourceResult(model, results)
})
