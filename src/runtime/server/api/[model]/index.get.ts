// server/api/[model]/index.get.ts
import { eventHandler, getRouterParams } from 'h3'
import { getTableForModel, filterHiddenFields } from '../../utils/modelMapper'
import { useRuntimeConfig } from '#imports'

// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

export default eventHandler(async (event) => {
  const { auth } = useRuntimeConfig().autoCrud
  if (auth?.enabled) {
    // @ts-expect-error - #auth-utils is an optional module
    const { requireUserSession } = await import('#auth-utils')
    await requireUserSession(event)
  }

  const { model } = getRouterParams(event)
  const table = getTableForModel(model)

  if (auth?.authorization) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - #authorization is an optional module
    const { authorize } = await import('#authorization')
    await authorize(model, 'read')
  }

  const records = await useDrizzle().select().from(table).all()

  return records.map((record: Record<string, unknown>) => filterHiddenFields(model, record))
})
