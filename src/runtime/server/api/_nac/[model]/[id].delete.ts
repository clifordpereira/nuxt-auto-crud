import { eventHandler, getRouterParams } from 'h3'
import { useRuntimeConfig } from '#imports'

import { nacModelTableMap } from '../../../utils/modelMapper'
import { nacDeleteRow } from '../../../utils/queries'
import { nacBroadcast } from '../../../utils/sse-bus'

import { NacResourceNotFoundError } from '../../../exceptions'

import type { NacTableWithId } from '../../../types'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }

  const table = nacModelTableMap[model] as NacTableWithId
  if (!table) throw new NacResourceNotFoundError(model)

  const deletedRecord = await nacDeleteRow(table, id)

  const { realtime } = useRuntimeConfig().autoCrud
  if (realtime) {
    void nacBroadcast({
      table: model,
      action: 'delete',
      primaryKey: deletedRecord.id as number | string,
      data: deletedRecord,
    })
  }

  return deletedRecord
})
