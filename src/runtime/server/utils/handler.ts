import { createError } from 'h3'
import type { H3Event } from 'h3'

import { checkAdminAccess } from './auth'
import { filterHiddenFields, filterPublicColumns } from './modelMapper'

export async function ensureResourceAccess(event: H3Event, model: string, action: string): Promise<boolean> {
  // This throws 403 if not authorized
  const isAuthorized = await checkAdminAccess(event, model, action)
  if (!isAuthorized) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  return true
}

export function formatResourceResult(model: string, data: Record<string, unknown>, isAdmin: boolean) {
  if (isAdmin) {
    return filterHiddenFields(model, data)
  }
  else {
    return filterPublicColumns(model, data)
  }
}
