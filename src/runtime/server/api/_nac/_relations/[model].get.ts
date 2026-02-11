import { eventHandler, getRouterParams } from 'h3'
import type { Table } from 'drizzle-orm'

import { getTableRelations, modelTableMap } from '../../../utils/modelMapper'

import { ResourceNotFoundError } from '../../../exceptions'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event)
  if (!model) throw ResourceNotFoundError

  const table = modelTableMap[model] as Table
  if (!table) throw ResourceNotFoundError

  const relations = getTableRelations(table)

  return relations
})
