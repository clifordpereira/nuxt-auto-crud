// server/api/_nac/[model]/[id].patch.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import { eq } from 'drizzle-orm'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'

import { getTableForModel, getZodSchema, filterUpdatableFields, formatResourceResult } from '../../../utils/modelMapper'
import type { TableWithId } from '../../../types'
import { RecordNotFoundError } from '../../../exceptions'
import { broadcast } from '../../../utils/sse-bus'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  const table = getTableForModel(model) as TableWithId
  const body = await readBody(event)

  const sanitizedBody = filterUpdatableFields(model, body)
  const schema = getZodSchema(model, 'patch')
  const payload = await schema.parseAsync(sanitizedBody)

  // Automatically update updatedAt if it exists
  const updatePayload = {
    ...payload,
    ...('updatedAt' in table ? { updatedAt: new Date() } : {}),
  }

  const updatedRecord = (await db
    .update(table)
    .set(updatePayload)
    .where(eq(table.id, Number(id)))
    .returning()
    .get()) as Record<string, unknown>

  if (!updatedRecord) throw new RecordNotFoundError()

  const sanitizedData = formatResourceResult(model, updatedRecord)

  await broadcast({
    table: model,
    action: 'update',
    primaryKey: updatedRecord.id,
    data: sanitizedData,
  })

  return sanitizedData
})
