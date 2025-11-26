// server/api/[model]/index.get.ts
import { eventHandler, getRouterParams } from 'h3'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event)
  const table = getTableForModel(model)

  const records = await useDrizzle().select().from(table).all()

  return records
})
