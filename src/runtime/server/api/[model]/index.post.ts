// server/api/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import { getTableForModel, filterUpdatableFields } from '../../utils/modelMapper'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { ensureResourceAccess, formatResourceResult, hashPayloadFields } from '../../utils/handler'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }
  const isAdmin = await ensureResourceAccess(event, model, 'create')

  const table = getTableForModel(model)

  const body = await readBody(event)
  const payload = filterUpdatableFields(model, body)

  // Auto-hash fields based on config (default: ['password'])
  await hashPayloadFields(payload)

  const newRecord = await db.insert(table).values(payload).returning().get()

  return formatResourceResult(model, newRecord as Record<string, unknown>, isAdmin)
})
