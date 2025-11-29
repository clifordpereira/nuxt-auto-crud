// server/api/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody, createError } from 'h3'
import { getTableForModel, filterHiddenFields, filterUpdatableFields, filterPublicColumns } from '../../utils/modelMapper'
import { useRuntimeConfig } from '#imports'

// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

import { verifyJwtToken } from '../../utils/jwt'
import { useAutoCrudConfig } from '../../utils/config'

export default eventHandler(async (event) => {
  const { auth, resources } = useAutoCrudConfig()
  let isAdmin = false

  if (auth?.enabled) {
    if (auth.type === 'jwt') {
      if (!auth.jwtSecret) {
        console.warn('JWT Secret is not configured but auth type is jwt')
        isAdmin = false
      } else {
        isAdmin = await verifyJwtToken(event, auth.jwtSecret)
      }
    } else {
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
         // Fallback or error?
         throw new Error('requireUserSession is not available')
      }
    }
  } else {
    isAdmin = true
  }

  const { model } = getRouterParams(event)

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

  if (isAdmin && auth?.authorization) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - #authorization is an optional module
    const { authorize } = await import('#authorization')
    await authorize(model, 'create')
  }

  const body = await readBody(event)
  const payload = filterUpdatableFields(model, body)

  const newRecord = await useDrizzle().insert(table).values(payload).returning().get()

  if (isAdmin) {
    return filterHiddenFields(model, newRecord as Record<string, unknown>)
  } else {
    return filterPublicColumns(model, newRecord as Record<string, unknown>)
  }
})
