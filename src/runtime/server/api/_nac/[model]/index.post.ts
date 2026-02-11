// server/api/_nac/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody } from 'h3'

import { modelTableMap, resolveValidatedSchema } from '../../../utils/modelMapper'
import { createRow } from '../../../utils/queries'
import { broadcast } from '../../../utils/sse-bus'

import { ResourceNotFoundError } from '../../../exceptions'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string }
  const body = await readBody(event)

  const table = modelTableMap[model]
  if (!table) throw new ResourceNotFoundError(model);

  const validatedData = await resolveValidatedSchema(table, 'insert').parseAsync(body)

  const newRecord = await createRow(table, validatedData, event.context.nac || {})

  await broadcast({
    table: model,
    action: 'create',
    primaryKey: newRecord.id,
    data: newRecord,
  })

  return newRecord
})
