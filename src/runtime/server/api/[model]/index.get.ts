// server/api/[model]/index.get.ts
import { eventHandler, getRouterParams } from 'h3'
import { getTableForModel } from '../../utils/modelMapper'

// @ts-expect-error - #site/drizzle is an alias defined by the module
import { useDrizzle } from '#site/drizzle'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event)
  const table = getTableForModel(model)

  const records = await useDrizzle().select().from(table).all()

  return records
})
