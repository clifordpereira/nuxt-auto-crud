// server/api/[model]/[id].get.ts
import { eventHandler, getRouterParams, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel } from '../../utils/modelMapper'
import type { TableWithId } from '../../types'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'
import { ensureResourceAccess, formatResourceResult } from '../../utils/handler'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  const isAdmin = await ensureResourceAccess(event, model, 'read')

  const table = getTableForModel(model) as TableWithId

  const record = await useDrizzle()
    .select()
    .from(table)
    .where(eq(table.id, Number(id)))
    .get()

  if (!record) {
    throw createError({
      statusCode: 404,
      message: 'Record not found',
    })
  }

  return formatResourceResult(model, record as Record<string, unknown>, isAdmin)
})
