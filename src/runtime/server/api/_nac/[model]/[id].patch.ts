// server/api/_nac/[model]/[id].patch.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import { modelTableMap, getZodSchema, filterUpdatableFields } from '../../../utils/modelMapper'
import type { TableWithId } from '../../../types'
import { updateRow } from '../../../utils/queries'
import { RecordNotFoundError } from '../../../exceptions'
import { broadcast } from '../../../utils/sse-bus'

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string, id: string }
  const table = modelTableMap[model] as TableWithId
  const body = await readBody(event)

  const sanitizedBody = filterUpdatableFields(model, body)
  const schema = getZodSchema(model, 'patch')
  const payload = await schema.parseAsync(sanitizedBody)

  const updatedRecord = await updateRow(table, id, payload, event.context.nac || {})
  if (!updatedRecord) throw new RecordNotFoundError()

  await broadcast({
    table: model,
    action: 'update',
    primaryKey: updatedRecord.id,
    data: updatedRecord,
  })

  return updatedRecord
})
