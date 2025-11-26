// server/api/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody } from 'h3'
import { getTableForModel } from '../../utils/modelMapper'

import type { ModuleDatabase } from '../../types'

// TODO: Better type for useDrizzle
declare function useDrizzle(): ModuleDatabase

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event)
  const table = getTableForModel(model)
  const body = await readBody(event)

  // Add createdAt timestamp
  const values = {
    ...body,
    createdAt: new Date(),
  }

  const record = await useDrizzle()
    .insert(table)
    .values(values)
    .returning()
    .get()

  return record
})
