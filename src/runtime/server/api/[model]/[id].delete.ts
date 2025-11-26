// server/api/[model]/[id].delete.ts
export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event)
  const table = getTableForModel(model)
  const singularName = getModelSingularName(model)

  const deletedRecord = await useDrizzle()
    .delete(table)
    .where(eq(table.id, Number(id)))
    .returning()
    .get()

  if (!deletedRecord) {
    throw createError({
      statusCode: 404,
      message: `${singularName} not found`,
    })
  }

  return deletedRecord
})
