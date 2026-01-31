// server/api/[model]/[id].get.ts
import { eventHandler, getRouterParams } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, formatResourceResult } from '../../utils/modelMapper'
import type { TableWithId } from '../../types'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { ensureResourceAccess } from '../../utils/guard'
import { RecordNotFoundError } from '../../exceptions'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  await ensureResourceAccess(event, model, 'read', { id })

  const isGuest = event.context.isGuest ?? false

  const table = getTableForModel(model) as TableWithId

  const record = await db
    .select()
    .from(table)
    .where(eq(table.id, Number(id)))
    .get()

  if (!record) {
    throw new RecordNotFoundError()
  }

  return formatResourceResult(model, record as Record<string, unknown>, isGuest)
})
