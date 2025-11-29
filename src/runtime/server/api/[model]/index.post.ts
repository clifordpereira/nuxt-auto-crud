// server/api/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody, createError } from 'h3'
import { getTableForModel, filterHiddenFields, filterUpdatableFields, filterPublicColumns } from '../../utils/modelMapper'

// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

import { useAutoCrudConfig } from '../../utils/config'
import { checkAdminAccess } from '../../utils/auth'

export default eventHandler(async (event) => {
  const { resources } = useAutoCrudConfig()
  const { model } = getRouterParams(event) as { model: string }

  const isAdmin = await checkAdminAccess(event, model, 'create')

  // Check public access if not admin
  if (!isAdmin) {
    const resourceConfig = resources?.[model]
    const isPublic = resourceConfig?.public === true || (Array.isArray(resourceConfig?.public) && resourceConfig.public.includes('create'))

    if (!isPublic) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }
  }

  const table = getTableForModel(model)

  const body = await readBody(event)
  const payload = filterUpdatableFields(model, body)

  const newRecord = await useDrizzle().insert(table).values(payload).returning().get()

  if (isAdmin) {
    return filterHiddenFields(model, newRecord as Record<string, unknown>)
  }
  else {
    return filterPublicColumns(model, newRecord as Record<string, unknown>)
  }
})
