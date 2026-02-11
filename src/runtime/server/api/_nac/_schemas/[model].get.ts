import { eventHandler, getRouterParam, getRouterParams } from 'h3'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'

import { drizzleTableToFields } from '../../../utils/schema'
import { ResourceNotFoundError } from '../../../exceptions'
import { modelTableMap } from '../../../utils/modelMapper'


export default eventHandler(async (event) => {
  const { model } = getRouterParams(event)
  if (!model) throw ResourceNotFoundError

  const table = modelTableMap[model]
  if (!table) throw new ResourceNotFoundError(model);

  const schema = drizzleTableToFields(table as SQLiteTable, model)
  if (!schema) throw ResourceNotFoundError

  return schema
})
