import { eventHandler, getRouterParam } from 'h3'

import { getSchema } from '../../../utils/schema'
import { ResourceNotFoundError } from '../../../exceptions'

export default eventHandler(async (event) => {
  const tableName = getRouterParam(event, 'table')
  if (!tableName) throw ResourceNotFoundError

  const schema = await getSchema(tableName)
  if (!schema) throw ResourceNotFoundError

  return schema
})
