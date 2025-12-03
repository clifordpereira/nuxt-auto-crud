// server/api/[model]/[id].patch.ts
import { eventHandler, getRouterParams, readBody, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, filterUpdatableFields, filterHiddenFields, filterPublicColumns } from '../../utils/modelMapper'

import type { TableWithId } from '../../types'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

import { useAutoCrudConfig } from '../../utils/config'
import { checkAdminAccess } from '../../utils/auth'

export default eventHandler(async (event) => {
  const { resources } = useAutoCrudConfig()
  const { model, id } = getRouterParams(event) as { model: string, id: string }

  const isAdmin = await checkAdminAccess(event, model, 'update')

  // Check public access if not admin
  if (!isAdmin) {
    const resourceConfig = resources?.[model]
    const isPublic = resourceConfig?.public === true || (Array.isArray(resourceConfig?.public) && resourceConfig.public.includes('update'))

    if (!isPublic) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }
  }

  const table = getTableForModel(model) as TableWithId

  const body = await readBody(event)
  const payload = filterUpdatableFields(model, body)

  // Automatically update updatedAt if it exists
  if ('updatedAt' in table) {
    payload.updatedAt = new Date()
  }

  const updatedRecord = await useDrizzle()
    .update(table)
    .set(payload)
    .where(eq(table.id, Number(id)))
    .returning()
    .get()

  if (!updatedRecord) {
    throw createError({
      statusCode: 404,
      message: 'Record not found',
    })
  }

  if (isAdmin) {
    return filterHiddenFields(model, updatedRecord as Record<string, unknown>)
  }
  else {
    return filterPublicColumns(model, updatedRecord as Record<string, unknown>)
  }
})
