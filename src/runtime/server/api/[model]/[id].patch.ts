// server/api/[model]/[id].patch.ts
import { eventHandler, getRouterParams, readBody, createError } from 'h3'
import type { H3Event } from 'h3'
import { getUserSession } from '#imports'
import { eq } from 'drizzle-orm'
import { getTableForModel, filterUpdatableFields } from '../../utils/modelMapper'
import type { TableWithId } from '../../types'

// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
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

  // Inject updatedBy if user is authenticated
  try {
    const session = await (getUserSession as (event: H3Event) => Promise<{ user: { id: string | number } | null }>)(event)
    if (session?.user?.id) {
      if ('updatedBy' in table) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload as any).updatedBy = session.user.id
      }
    }
  }
  catch {
    // No session available
  }

  const updatedRecord = await db
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
