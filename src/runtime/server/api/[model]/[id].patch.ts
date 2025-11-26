// server/api/[model]/[id].patch.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, filterUpdatableFields } from '../../utils/modelMapper'

import type { TableWithId } from '../../types'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event)
  const table = getTableForModel(model) as TableWithId
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
