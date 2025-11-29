// server/api/[model]/index.get.ts
import { eventHandler, getRouterParams, createError } from 'h3'
import { getTableForModel, filterHiddenFields, filterPublicColumns } from '../../utils/modelMapper'
import { useRuntimeConfig } from '#imports'

// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

export default eventHandler(async (event) => {
  console.log('[GET] Request received', event.path)
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
        // Not authenticated
        isAdmin = false
      }
    } else {
       console.warn('requireUserSession is not available globally')
       // Fallback or error?
       // If auth is enabled, we expect it to be available.
       // But if it's not, we might want to throw to fail the test.
       throw new Error('requireUserSession is not available')
    }
  } else {
    // Auth disabled = everyone is admin (or public with full access)
    isAdmin = true
  }

  const { model } = getRouterParams(event)
  
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

  const table = getTableForModel(model)

  if (isAdmin && auth?.authorization) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - #authorization is an optional module
    const { authorize } = await import('#authorization')
    await authorize(model, 'list')
  }

  const results = await useDrizzle().select().from(table).all()

  return results.map((item: Record<string, unknown>) => {
    if (isAdmin) {
      return filterHiddenFields(model, item as Record<string, unknown>)
    } else {
      return filterPublicColumns(model, item as Record<string, unknown>)
    }
  })
})
