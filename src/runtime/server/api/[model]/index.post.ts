// server/api/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import { getTableForModel, filterHiddenFields } from '../../utils/modelMapper'
import { useRuntimeConfig } from '#imports'

// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

export default eventHandler(async (event) => {
  const { auth } = useRuntimeConfig().autoCrud
  if (auth?.enabled) {
    // Try using global auto-import
    // @ts-ignore
    if (typeof requireUserSession === 'function') {
      // @ts-ignore
      await requireUserSession(event)
    } else {
       // Fallback or error?
       throw new Error('requireUserSession is not available')
    }
  }

  const { model } = getRouterParams(event)
  const table = getTableForModel(model)

  if (auth?.authorization) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - #authorization is an optional module
    const { authorize } = await import('#authorization')
    await authorize(model, 'create')
  }

  const body = await readBody(event)

  // Add createdAt timestamp
  const values = {
    ...body,
    createdAt: new Date(),
  }

  const record = await useDrizzle()
    .insert(table)
    .values(values)
    .returning()
    .get()

  return filterHiddenFields(model, record as Record<string, unknown>)
})
