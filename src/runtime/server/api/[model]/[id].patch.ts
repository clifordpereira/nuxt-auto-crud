// server/api/[model]/[id].patch.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import type { H3Event } from 'h3'

import { eq } from 'drizzle-orm'
import { getTableForModel, getZodSchema } from '../../utils/modelMapper'
import type { TableWithId } from '../../types'

// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { ensureResourceAccess, formatResourceResult, hashPayloadFields } from '../../utils/handler'
import { RecordNotFoundError } from '../../exceptions'
import { broadcast } from '../../utils/sse-bus'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  // Pass the ID as context for row-level security checks (e.g. self-update)
  await ensureResourceAccess(event, model, 'update', { id })

  // Determine if request is from an authenticated user (Admin/User) or Guest
  const isGuest = event.context.isGuest ?? false

  const table = getTableForModel(model) as TableWithId

  const body = await readBody(event)
  const schema = getZodSchema(model, 'patch')
  const payload = await schema.parseAsync(body)

  // Auto-hash fields based on config (default: ['password'])
  await hashPayloadFields(payload)

  // Automatically update updatedAt if it exists
  if ('updatedAt' in table) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload as any).updatedAt = new Date()
  }

  const updatedRecord = await db
    .update(table)
    .set(payload)
    .where(eq(table.id, Number(id)))
    .returning()
    .get() as Record<string, unknown>

  if (!updatedRecord) {
    throw new RecordNotFoundError()
  }

  broadcast({
    table: model,
    action: 'update',
    primaryKey: updatedRecord.id,
    data: updatedRecord,
  })

  return formatResourceResult(model, updatedRecord, isGuest)
})
