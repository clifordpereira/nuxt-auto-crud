import { eventHandler, getRouterParams, readBody } from 'h3'

import { modelTableMap } from '../../../utils/modelMapper'
import { resolveValidatedSchema } from '../../../utils/validator'
import { updateRow } from '../../../utils/queries'
import { broadcast } from '../../../utils/sse-bus'

import { ResourceNotFoundError } from '../../../exceptions'

import type { TableWithId } from '../../../types'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  const body = await readBody(event)

  const table = modelTableMap[model] as TableWithId
  if (!table) throw new ResourceNotFoundError(model)

  const validatedData = await resolveValidatedSchema(table, 'patch').parseAsync(body)
  const updatedRecord = await updateRow(table, id, validatedData, event.context.nac || {})

  const { realtime } = useRuntimeConfig().autoCrud
  if (realtime) {
    void broadcast({
      table: model,
      action: 'update',
      primaryKey: updatedRecord.id,
      data: updatedRecord,
    })
  }

  return updatedRecord
})
