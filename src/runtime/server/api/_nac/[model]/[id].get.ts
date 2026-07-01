import { eventHandler, getRouterParams } from 'h3'

import { nacModelTableMap } from '../../../utils/modelMapper'
import { nacGetRow } from '../../../utils/queries'

import { NacResourceNotFoundError } from '../../../exceptions'

import type { NacTableWithId } from '../../../types'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }

  const table = nacModelTableMap[model] as NacTableWithId
  if (!table) throw new NacResourceNotFoundError(model)

  return await nacGetRow(table, id, event.context.nac || {})
})
