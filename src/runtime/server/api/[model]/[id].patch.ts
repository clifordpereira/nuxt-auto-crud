// server/api/[model]/[id].patch.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, filterUpdatableFields } from '../../utils/modelMapper'

// TODO: Better type for useDrizzle
declare function useDrizzle(): any

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event)
  const table = getTableForModel(model)
  const body = await readBody(event)

  // Filter to only allow updatable fields for this model
  const updateData = filterUpdatableFields(model, body)

  const record = await useDrizzle()
    .update(table)
    .set(updateData)
    .where(eq(table.id, Number(id)))
    .returning()
    .get()

  return record
})
