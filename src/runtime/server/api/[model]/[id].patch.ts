// server/api/[model]/[id].patch.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { getTableForModel, filterUpdatableFields, filterHiddenFields } from '../../utils/modelMapper'
import { useRuntimeConfig } from '#imports'

import type { TableWithId } from '../../types'
// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

export default eventHandler(async (event) => {
  const { auth } = useRuntimeConfig().autoCrud
  if (auth?.enabled) {
    // @ts-expect-error - #auth-utils is an optional module
    const { requireUserSession } = await import('#auth-utils')
    await requireUserSession(event)
  }

  const { model, id } = getRouterParams(event)
  const table = getTableForModel(model) as TableWithId

  if (auth?.authorization) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - #authorization is an optional module
    const { authorize } = await import('#authorization')
    await authorize(model, 'update')
  }
  const body = await readBody(event)

  // Filter to only allow updatable fields for this model
  const updateData = filterUpdatableFields(model, body)

  const record = await useDrizzle()
    .update(table)
    .set(updateData)
    .where(eq(table.id, Number(id)))
    .returning()
    .get()

  return filterHiddenFields(model, record as Record<string, unknown>)
})
