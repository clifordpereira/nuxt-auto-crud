import { eventHandler, getRouterParams } from 'h3'

import { modelTableMap } from '../../../utils/modelMapper'
import { nacGetRow } from '../../../utils/queries'

import { ResourceNotFoundError } from '../../../exceptions'

import type { TableWithId } from '../../../types'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }

  const table = modelTableMap[model] as TableWithId
  if (!table) throw new ResourceNotFoundError(model)

  return await nacGetRow(table, id, event.context.nac || {})
})
