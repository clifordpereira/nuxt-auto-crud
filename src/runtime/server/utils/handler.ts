import { createError } from 'h3'
import type { H3Event } from 'h3'
import { useAutoCrudConfig } from './config'
import { checkAdminAccess } from './auth'
import { filterHiddenFields, filterPublicColumns } from './modelMapper'

export async function ensureResourceAccess(event: H3Event, model: string, action: string): Promise<boolean> {
  const { resources } = useAutoCrudConfig()
  const isAdmin = await checkAdminAccess(event, model, action)

  // Check public access if not admin
  if (!isAdmin) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resourceConfig = (resources as any)?.[model]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isPublic = resourceConfig?.public === true || (Array.isArray(resourceConfig?.public) && (resourceConfig.public as any[]).includes(action))

    if (!isPublic) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }
  }

  return isAdmin
}

export function formatResourceResult(model: string, data: Record<string, unknown>, isAdmin: boolean) {
  if (isAdmin) {
    return filterHiddenFields(model, data)
  }
  else {
    return filterPublicColumns(model, data)
  }
}
