import { eventHandler, getRouterParams } from 'h3'

import { nacModelTableMap } from '../../../utils/modelMapper'
import { nacGetRows } from '../../../utils/queries'

import { NacResourceNotFoundError } from '../../../exceptions'

import type { NacTableWithId } from '../../../types'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }

  const table = nacModelTableMap[model] as NacTableWithId
  if (!table) throw new NacResourceNotFoundError(model)

  const results = await nacGetRows(table, event.context.nac || {})
  return results
})
