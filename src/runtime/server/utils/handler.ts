import { createError } from 'h3'
import type { H3Event } from 'h3'
import { useAutoCrudConfig } from './config'
import { checkAdminAccess } from './auth'
import { filterHiddenFields, filterPublicColumns } from './modelMapper'

// @ts-expect-error - #imports is available in runtime
import { getUserSession } from '#imports'

export async function ensureResourceAccess(event: H3Event, model: string, action: string): Promise<boolean> {
  const { auth } = useAutoCrudConfig()
  
  // This throws 403 if not authorized
  const isAuthorized = await checkAdminAccess(event, model, action)
  if (!isAuthorized) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // If authentication is disabled, treated as fully inclusive access
  if (!auth?.authentication) {
    return true
  }

  // Check if user is authenticated
  const session = await getUserSession(event)
  return !!session.user
}

export function formatResourceResult(model: string, data: Record<string, unknown>, isAdmin: boolean) {
  if (isAdmin) {
    return filterHiddenFields(model, data)
  }
  else {
    return filterPublicColumns(model, data)
  }
}
