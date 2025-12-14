// server/api/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import type { H3Event } from 'h3'
import { getUserSession } from '#imports'
import { getTableForModel, filterUpdatableFields } from '../../utils/modelMapper'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { ensureResourceAccess, formatResourceResult, hashPayloadFields } from '../../utils/handler'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }
  const isAdmin = await ensureResourceAccess(event, model, 'create')

  const table = getTableForModel(model)

  const body = await readBody(event)
  const payload = filterUpdatableFields(model, body)

  // Auto-hash fields based on config (default: ['password'])
  await hashPayloadFields(payload)

  // Inject createdBy/updatedBy if user is authenticated
  try {
    const session = await (getUserSession as (event: H3Event) => Promise<{ user: { id: string | number } | null }>)(event)
    if (session?.user?.id) {
       // Check if table has columns before assigning (optional but safer if we had strict types)
       // Since we are passing payload to .values(), extra keys might be ignored or cause error depending on driver
       // Using 'in' table check is good practice
       if ('createdBy' in table) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (payload as any).createdBy = session.user.id
       }
       if ('updatedBy' in table) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (payload as any).updatedBy = session.user.id
       }
    }
  } catch (e) {
    // No session available
  }

  const newRecord = await db.insert(table).values(payload).returning().get()

  return formatResourceResult(model, newRecord as Record<string, unknown>, isAdmin)
})
