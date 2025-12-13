// server/api/[model]/[id].patch.ts
import { eventHandler, getRouterParams, readBody, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, filterUpdatableFields } from '../../utils/modelMapper'
import type { TableWithId } from '../../types'

// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'
import { ensureResourceAccess, formatResourceResult, hashPayloadFields } from '../../utils/handler'


export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  // Pass the ID as context for row-level security checks (e.g. self-update)
  const isAdmin = await ensureResourceAccess(event, model, 'update', { id })

  const table = getTableForModel(model) as TableWithId

  const body = await readBody(event)
  const payload = filterUpdatableFields(model, body)

  // Auto-hash fields based on config (default: ['password'])
  // Auto-hash fields based on config (default: ['password'])
  await hashPayloadFields(payload)


  // Automatically update updatedAt if it exists
  if ('updatedAt' in table) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload as any).updatedAt = new Date()
  }

  const updatedRecord = await useDrizzle()
    .update(table)
    .set(payload)
    .where(eq(table.id, Number(id)))
    .returning()
    .get()

  if (!updatedRecord) {
    throw createError({
      statusCode: 404,
      message: 'Record not found',
    })
  }

  return formatResourceResult(model, updatedRecord as Record<string, unknown>, isAdmin)
})
