// server/api/[model]/index.get.ts
import { eventHandler, getRouterParams, createError } from 'h3'
import { getTableForModel, filterHiddenFields, filterPublicColumns } from '../../utils/modelMapper'

// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

import { useAutoCrudConfig } from '../../utils/config'
import { checkAdminAccess } from '../../utils/auth'

import { desc } from 'drizzle-orm'
import type { TableWithId } from '../../types'

export default eventHandler(async (event) => {
  console.log('[GET] Request received', event.path)
  const { resources } = useAutoCrudConfig()
  const { model } = getRouterParams(event) as { model: string }

  const isAdmin = await checkAdminAccess(event, model, 'list')

  // Check public access if not admin
  if (!isAdmin) {
    const resourceConfig = resources?.[model]
    const isPublic = resourceConfig?.public === true || (Array.isArray(resourceConfig?.public) && resourceConfig.public.includes('list'))

    if (!isPublic) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }
  }

  const table = getTableForModel(model) as TableWithId

  const results = await useDrizzle().select().from(table).orderBy(desc(table.id)).all()

  return results.map((item: Record<string, unknown>) => {
    if (isAdmin) {
      return filterHiddenFields(model, item as Record<string, unknown>)
    }
    else {
      return filterPublicColumns(model, item as Record<string, unknown>)
    }
  })
})
