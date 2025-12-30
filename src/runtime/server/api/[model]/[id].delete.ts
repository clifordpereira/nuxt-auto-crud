// server/api/[model]/[id].delete.ts
import { eventHandler, getRouterParams } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, getModelSingularName } from '../../utils/modelMapper'
import type { TableWithId } from '../../types'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { ensureResourceAccess, formatResourceResult } from '../../utils/handler'
import { RecordNotFoundError } from '../../exceptions'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  const isAdmin = await ensureResourceAccess(event, model, 'delete', { id })

  const table = getTableForModel(model) as TableWithId
  const singularName = getModelSingularName(model)

  const deletedRecord = await db
    .delete(table)
    .where(eq(table.id, Number(id)))
    .returning()
    .get()

  if (!deletedRecord) {
    throw new RecordNotFoundError(`${singularName} not found`)
  }

  return formatResourceResult(model, deletedRecord as Record<string, unknown>, isAdmin)
})
