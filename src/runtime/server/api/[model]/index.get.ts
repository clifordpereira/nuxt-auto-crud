// server/api/[model]/index.get.ts
import { eventHandler, getRouterParams } from 'h3'
import { getTableForModel } from '../../utils/modelMapper'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'
import { desc } from 'drizzle-orm'
import type { TableWithId } from '../../types'
import { ensureResourceAccess, formatResourceResult } from '../../utils/handler'

export default eventHandler(async (event) => {
  console.log('[GET] Request received', event.path)
  const { model } = getRouterParams(event) as { model: string }
  const isAdmin = await ensureResourceAccess(event, model, 'list')

  const table = getTableForModel(model) as TableWithId

  const results = await useDrizzle().select().from(table).orderBy(desc(table.id)).all()

  return results.map((item: Record<string, unknown>) => formatResourceResult(model, item, isAdmin))
})
