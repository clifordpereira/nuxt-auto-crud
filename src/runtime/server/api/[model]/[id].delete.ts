// server/api/[model]/[id].delete.ts
import { eventHandler, getRouterParams } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, getModelSingularName, formatResourceResult } from '../../utils/modelMapper'
import type { TableWithId } from '../../types'

// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { ensureResourceAccess } from '../../utils/guard'
import { RecordNotFoundError } from '../../exceptions'
import { broadcast } from '../../utils/sse-bus'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  await ensureResourceAccess(event, model, 'delete', { id })

  const isGuest = event.context.isGuest ?? false

  const table = getTableForModel(model) as TableWithId
  const singularName = getModelSingularName(model)

  const deletedRecord = await db
    .delete(table)
    .where(eq(table.id, Number(id)))
    .returning()
    .get() as Record<string, unknown>

  if (!deletedRecord) {
    throw new RecordNotFoundError(`${singularName} not found`)
  }

  broadcast({
    table: model,
    action: 'delete',
    primaryKey: deletedRecord.id,
    data: deletedRecord,
  })

  return formatResourceResult(model, deletedRecord, isGuest)
})
