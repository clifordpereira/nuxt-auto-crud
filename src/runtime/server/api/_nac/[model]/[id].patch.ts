import { eventHandler, getRouterParams, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { nacModelTableMap } from '../../../utils/modelMapper'
import { nacResolveValidatedSchema } from '../../../utils/validator'
import { nacUpdateRow } from '../../../utils/queries'
import { nacBroadcast } from '../../../utils/sse-bus'

import { NacResourceNotFoundError } from '../../../exceptions'

import type { NacTableWithId } from '../../../types'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  const body = await readBody(event)

  const table = nacModelTableMap[model] as NacTableWithId
  if (!table) throw new NacResourceNotFoundError(model)

  const validatedData = await nacResolveValidatedSchema(table, 'patch').parseAsync(body)
  const updatedRecord = await nacUpdateRow(table, id, validatedData, event.context.nac || {})

  const { realtime } = useRuntimeConfig().autoCrud
  if (realtime) {
    void nacBroadcast({
      table: model,
      action: 'update',
      primaryKey: updatedRecord.id,
      data: updatedRecord,
    })
  }

  return updatedRecord
})
