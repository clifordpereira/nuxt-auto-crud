// server/api/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import { getTableForModel, filterUpdatableFields } from '../../utils/modelMapper'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'
import { ensureResourceAccess, formatResourceResult } from '../../utils/handler'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }
  const isAdmin = await ensureResourceAccess(event, model, 'create')

  const table = getTableForModel(model)

  const body = await readBody(event)
  const payload = filterUpdatableFields(model, body)

  const newRecord = await useDrizzle().insert(table).values(payload).returning().get()

  return formatResourceResult(model, newRecord as Record<string, unknown>, isAdmin)
})
