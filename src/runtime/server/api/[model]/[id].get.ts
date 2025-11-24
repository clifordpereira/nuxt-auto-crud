// server/api/[model]/[id].get.ts
export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event)
  const table = getTableForModel(model)
  const singularName = getModelSingularName(model)

  const record = await useDrizzle()
    .select()
    .from(table)
    .where(eq(table.id, Number(id)))
    .get()

  if (!record) {
    throw createError({
      statusCode: 404,
      message: `${singularName} not found`,
    })
  }

  return record
})
