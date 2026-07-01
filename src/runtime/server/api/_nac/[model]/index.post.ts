import { eventHandler, getRouterParams, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { modelTableMap } from '../../../utils/modelMapper'
import { nacResolveValidatedSchema } from '../../../utils/validator'
import { nacCreateRow } from '../../../utils/queries'
import { nacBroadcast } from '../../../utils/sse-bus'

import { NacResourceNotFoundError } from '../../../exceptions'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }
  const body = await readBody(event)

  const table = modelTableMap[model]
  if (!table) throw new NacResourceNotFoundError(model)

  const validatedData = await nacResolveValidatedSchema(table, 'insert').parseAsync(body)

  const newRecord = await nacCreateRow(table, validatedData, event.context.nac || {})

  const { realtime } = useRuntimeConfig().autoCrud
  if (realtime) {
    void nacBroadcast({
      table: model,
      action: 'create',
      primaryKey: newRecord.id,
      data: newRecord,
    })
  }

  return newRecord
})
