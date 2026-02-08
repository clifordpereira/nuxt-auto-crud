// server/api/_nac/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import { getTableForModel, getZodSchema, formatResourceResult, filterUpdatableFields } from '../../../utils/modelMapper'
import { createRow } from '../../../utils/queries'
import { broadcast } from '../../../utils/sse-bus'
import type { TableWithId } from '../../../types'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }

  const table = getTableForModel(model) as TableWithId

  const body = await readBody(event)
  const sanitizedBody = filterUpdatableFields(model, body)
  const schema = getZodSchema(model, 'insert')
  const payload = await schema.parseAsync(sanitizedBody)

  const newRecord = await createRow(table, payload, event.context.nac || {})
  const sanitizedData = formatResourceResult(model, newRecord)

  await broadcast({
    table: model,
    action: 'create',
    primaryKey: newRecord.id,
    data: sanitizedData,
  })

  return sanitizedData
})
