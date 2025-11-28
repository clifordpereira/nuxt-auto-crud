// server/api/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import { getTableForModel, filterHiddenFields } from '../../utils/modelMapper'

// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event)
  const table = getTableForModel(model)
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
