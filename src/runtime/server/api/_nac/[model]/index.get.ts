// server/api/_nac/[model]/index.get.ts
import { eventHandler, getRouterParams } from 'h3'
import { modelTableMap } from '../../../utils/modelMapper'
import type { TableWithId } from '../../../types'
import { getRows } from '../../../utils/queries'
import { ResourceNotFoundError } from '../../../exceptions'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }

  const table = modelTableMap[model] as TableWithId
  if (!table) throw new ResourceNotFoundError(model);

  const results = await getRows(table, event.context.nac || {})
  return results
})
