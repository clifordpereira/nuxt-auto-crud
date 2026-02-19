import { eventHandler, getRouterParams } from 'h3'

import { modelTableMap } from '../../../utils/modelMapper'
import { nacGetRows } from '../../../utils/queries'

import { ResourceNotFoundError } from '../../../exceptions'

import type { TableWithId } from '../../../types'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }

  const table = modelTableMap[model] as TableWithId
  if (!table) throw new ResourceNotFoundError(model)

  const results = await nacGetRows(table, event.context.nac || {})
  return results
})
