import { createError } from 'h3'
import type { H3Event } from 'h3'

import { checkAdminAccess } from './auth'
import { filterHiddenFields, filterPublicColumns } from './modelMapper'
import { useAutoCrudConfig } from './config'

export async function ensureResourceAccess(event: H3Event, model: string, action: string, context?: unknown): Promise<boolean> {
  // This throws 403 if not authorized
  const isAuthorized = await checkAdminAccess(event, model, action, context)
  if (!isAuthorized) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  return true
}

export async function hashPayloadFields(payload: Record<string, unknown>): Promise<void> {
  // Auto-hash fields based on config (default: ['password'])
  const { hashedFields } = useAutoCrudConfig()
  
  if (hashedFields) {
    console.log('[hashPayloadFields] Configured hashedFields:', hashedFields)
    for (const field of hashedFields) {
      if (payload[field] && typeof payload[field] === 'string') {
        // @ts-expect-error - hashPassword is auto-imported from nuxt-auth-utils or stub
        payload[field] = await hashPassword(payload[field])
      }
    }
  }
}

export function formatResourceResult(model: string, data: Record<string, unknown>, isAdmin: boolean) {
  if (isAdmin) {
    return filterHiddenFields(model, data)
  }
  else {
    return filterPublicColumns(model, data)
  }
}
