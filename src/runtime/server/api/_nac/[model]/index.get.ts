// server/api/_nac/[model]/index.get.ts
import { eventHandler, getRouterParams } from 'h3'
import { getTableForModel, formatResourceResult } from '../../../utils/modelMapper'
import type { TableWithId } from '../../../types'
import { getRows } from '../../../utils/queries'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }

  const table = getTableForModel(model) as TableWithId
  const results = await getRows(table, event.context.nacAuth || {})

  return formatResourceResult(model, results)
})
