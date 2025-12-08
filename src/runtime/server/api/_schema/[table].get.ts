import { eventHandler, createError, getRouterParam } from 'h3'

import { getSchema } from '../../utils/schema'
import { ensureAuthenticated } from '../../utils/auth'

export default eventHandler(async (event) => {
  await ensureAuthenticated(event)
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
