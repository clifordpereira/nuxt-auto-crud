// server/api/[model]/index.get.ts
export default eventHandler(async (event) => {
  const { model } = getRouterParams(event)
  const table = getTableForModel(model)

  const records = await useDrizzle().select().from(table).all()

  return records
})
