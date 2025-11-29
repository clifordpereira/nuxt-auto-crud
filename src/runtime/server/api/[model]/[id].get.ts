// server/api/[model]/[id].get.ts
import { eventHandler, getRouterParams, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, filterHiddenFields, filterPublicColumns } from '../../utils/modelMapper'

import type { TableWithId } from '../../types'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

import { useAutoCrudConfig } from '../../utils/config'
import { checkAdminAccess } from '../../utils/auth'

export default eventHandler(async (event) => {
  const { resources } = useAutoCrudConfig()
  const { model, id } = getRouterParams(event) as { model: string, id: string }

  const isAdmin = await checkAdminAccess(event, model, 'read')

  // Check public access if not admin
  if (!isAdmin) {
    const resourceConfig = resources?.[model]
    const isPublic = resourceConfig?.public === true || (Array.isArray(resourceConfig?.public) && resourceConfig.public.includes('read'))

    if (!isPublic) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }
  }

  const table = getTableForModel(model) as TableWithId

  const record = await useDrizzle()
    .select()
    .from(table)
    .where(eq(table.id, Number(id)))
    .get()

  if (!record) {
    throw createError({
      statusCode: 404,
      message: 'Record not found',
    })
  }

  if (isAdmin) {
    return filterHiddenFields(model, record as Record<string, unknown>)
  }
  else {
    return filterPublicColumns(model, record as Record<string, unknown>)
  }
})
