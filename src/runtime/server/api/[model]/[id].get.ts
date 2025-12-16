// server/api/[model]/[id].get.ts
import { eventHandler, getRouterParams, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel } from '../../utils/modelMapper'
import type { TableWithId } from '../../types'
// @ts-expect-error - hub:db is a virtual alias
import { db } from 'hub:db'
import { ensureResourceAccess, formatResourceResult } from '../../utils/handler'
import { checkAdminAccess } from '../../utils/auth'
import { RecordNotFoundError } from '../../exceptions'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  const isAdmin = await ensureResourceAccess(event, model, 'read')

  const table = getTableForModel(model) as TableWithId

  const record = await db
    .select()
    .from(table)
    .where(eq(table.id, Number(id)))
    .get()

  if (!record) {
    throw new RecordNotFoundError()
  }

  // Filter inactive rows for non-admins (or those without list_all) if status field exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('status' in record && (record as any).status !== 'active') {
    const canListAll = await checkAdminAccess(event, model, 'list_all')
    if (!canListAll) {
      throw new RecordNotFoundError()
    }
  }

  return formatResourceResult(model, record as Record<string, unknown>, isAdmin)
})
