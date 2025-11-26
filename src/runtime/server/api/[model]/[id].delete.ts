// server/api/[model]/[id].delete.ts
import { eventHandler, getRouterParams, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, getModelSingularName } from '../../utils/modelMapper'

import type { TableWithId } from '../../types'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event)
  const table = getTableForModel(model) as TableWithId
  const singularName = getModelSingularName(model)

  const deletedRecord = await useDrizzle()
    .delete(table)
    .where(eq(table.id, Number(id)))
    .returning()
    .get()

  if (!deletedRecord) {
    throw createError({
      statusCode: 404,
      message: `${singularName} not found`,
    })
  }

  return deletedRecord
})
