// server/api/[model]/[id].delete.ts
import { eventHandler, getRouterParams, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, getModelSingularName } from '../../utils/modelMapper'
import type { TableWithId } from '../../types'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'
import { ensureResourceAccess, formatResourceResult } from '../../utils/handler'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  const isAdmin = await ensureResourceAccess(event, model, 'delete')

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

  return formatResourceResult(model, deletedRecord as Record<string, unknown>, isAdmin)
})
