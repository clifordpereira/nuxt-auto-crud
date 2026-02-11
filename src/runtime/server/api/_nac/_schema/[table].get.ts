import { eventHandler, getRouterParam } from 'h3'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'

import { drizzleTableToFields } from '../../../utils/schema'
import { ResourceNotFoundError } from '../../../exceptions'
import { modelTableMap } from '../../../utils/modelMapper'


export default eventHandler(async (event) => {
  const tableName = getRouterParam(event, 'table')
  if (!tableName) throw ResourceNotFoundError

  const table = modelTableMap[tableName]
  const schema = table ? drizzleTableToFields(table as SQLiteTable, tableName) : undefined
  if (!schema) throw ResourceNotFoundError

  return schema
})
