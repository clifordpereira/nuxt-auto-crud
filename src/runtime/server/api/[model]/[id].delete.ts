// server/api/[model]/[id].delete.ts
import { eventHandler, getRouterParams } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, getModelSingularName } from '../../utils/modelMapper'
import type { TableWithId } from '../../types'
// @ts-expect-error - #imports is a virtual alias
import { getUserSession } from '#imports'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { ensureResourceAccess, formatResourceResult } from '../../utils/handler'
import { RecordNotFoundError } from '../../exceptions'
import { broadcast } from '../../utils/sse-bus'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  await ensureResourceAccess(event, model, 'delete', { id })

  // Determine if request is from an authenticated user (Admin/User) or Guest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getUserSession as any)(event)
  const isGuest = !session?.user

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
