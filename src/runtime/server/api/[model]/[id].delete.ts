// server/api/[model]/[id].delete.ts
import { eventHandler, getRouterParams, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, getModelSingularName, filterHiddenFields, filterPublicColumns } from '../../utils/modelMapper'
import { useRuntimeConfig } from '#imports'

import type { TableWithId } from '../../types'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

export default eventHandler(async (event) => {
  const { auth, resources } = useRuntimeConfig().autoCrud
  let isAdmin = false

  if (auth?.enabled) {
    // Try using global auto-import
    // @ts-ignore
    if (typeof requireUserSession === 'function') {
      try {
        // @ts-ignore
        await requireUserSession(event)
        isAdmin = true
      } catch (e) {
        isAdmin = false
      }
    } else {
       throw new Error('requireUserSession is not available')
    }
  } else {
    isAdmin = true
  }

  const { model, id } = getRouterParams(event)

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

  if (isAdmin && auth?.authorization) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - #authorization is an optional module
    const { authorize } = await import('#authorization')
    await authorize(model, 'delete')
  }
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
