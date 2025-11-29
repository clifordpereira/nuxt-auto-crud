// server/api/[model]/[id].delete.ts
import { eventHandler, getRouterParams, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, getModelSingularName, filterHiddenFields, filterPublicColumns } from '../../utils/modelMapper'

import type { TableWithId } from '../../types'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

import { useAutoCrudConfig } from '../../utils/config'
import { checkAdminAccess } from '../../utils/auth'

export default eventHandler(async (event) => {
  const { resources } = useAutoCrudConfig()
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  
  const isAdmin = await checkAdminAccess(event, model, 'delete')

  // Check public access if not admin
  if (!isAdmin) {
    const resourceConfig = resources?.[model]
    const isPublic = resourceConfig?.public === true || (Array.isArray(resourceConfig?.public) && resourceConfig.public.includes('delete'))
    
    if (!isPublic) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }
  }

  const table = getTableForModel(model) as TableWithId

  const singularName = getModelSingularName(model)

  const deletedRecord = await useDrizzle()
    .delete(table)
    .where(eq(table.id, Number(id)))
    .returning()
    .get()

  if (!deletedRecord) {
    throw createError({
      statusCode: 404,
      message: `${singularName} not found`,
    })
  }

  if (isAdmin) {
    return filterHiddenFields(model, deletedRecord as Record<string, unknown>)
  } else {
    return filterPublicColumns(model, deletedRecord as Record<string, unknown>)
  }
})
