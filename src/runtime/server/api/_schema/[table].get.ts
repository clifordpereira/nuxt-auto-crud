import { eventHandler, createError, getRouterParam } from 'h3'

import { getSchema } from '../../utils/schema'

export default eventHandler(async (event) => {
  const tableName = getRouterParam(event, 'table')

  if (!tableName) {
    throw createError({ statusCode: 400, message: 'Table name is required' })
  }

  const schema = await getSchema(tableName)
  if (!schema) {
    throw createError({ statusCode: 404, message: `Table '${tableName}' not found` })
  }

  return schema
})
