// server/api/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import type { H3Event } from 'h3'
// @ts-expect-error - '#imports' is a virtual alias
import { getUserSession } from '#imports'
import { getTableForModel, getZodSchema } from '../../utils/modelMapper'
// @ts-expect-error - 'hub:db' is a virtual alias
import { db } from 'hub:db'
import { ensureResourceAccess, formatResourceResult, hashPayloadFields } from '../../utils/handler'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }
  const isAdmin = await ensureResourceAccess(event, model, 'create')

  const table = getTableForModel(model)

  const body = await readBody(event)
  const schema = getZodSchema(model, 'insert')
  const payload = await schema.parseAsync(body)

  // Custom check for status update permission (or just remove it during creation as per requirement)
  if ('status' in payload) {
    const { checkAdminAccess } = await import('../../utils/auth')
    const hasStatusPermission = await checkAdminAccess(event, model, 'update_status')
    if (!hasStatusPermission) {
      delete payload.status
    }
  }

  // Auto-hash fields based on config (default: ['password'])
  await hashPayloadFields(payload)

  // Inject createdBy/updatedBy if user is authenticated
  try {
    const session = await (getUserSession as (event: H3Event) => Promise<{ user: { id: string | number } | null }>)(event)
    if (session?.user?.id) {
      // Using 'in' table check is good practice to ensure column exists
      if ('createdBy' in table) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload as any).createdBy = session.user.id
      }
      if ('updatedBy' in table) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload as any).updatedBy = session.user.id
      }
    }
  }
  catch {
    // No session available
  }

  const newRecord = await db.insert(table).values(payload).returning().get()

  return formatResourceResult(model, newRecord as Record<string, unknown>, isAdmin)
})
