// server/api/_nac/[model]/[id].delete.ts
import { eventHandler, getRouterParams } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, formatResourceResult } from '../../../utils/modelMapper'
import type { TableWithId } from '../../../types'

// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { RecordNotFoundError } from '../../../exceptions'
import { broadcast } from '../../../utils/sse-bus'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }

  const table = getTableForModel(model) as TableWithId

  const deletedRecord = await db
    .delete(table)
    .where(eq(table.id, Number(id)))
    .returning()
    .get() as Record<string, unknown>

  if (!deletedRecord) throw new RecordNotFoundError()

  const sanitizedData = formatResourceResult(model, deletedRecord)

  broadcast({
    table: model,
    action: 'delete',
    primaryKey: deletedRecord.id,
    data: sanitizedData,
  })

  return sanitizedData
})
