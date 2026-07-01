import { eventHandler, getRouterParams } from 'h3'

import { nacGetSchemaDefinition } from '../../../utils/modelMapper'

import { NacResourceNotFoundError } from '../../../exceptions'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event)
  if (!model) throw new NacResourceNotFoundError('unknown')

  const schema = await nacGetSchemaDefinition(model)
  if (!schema) throw new NacResourceNotFoundError(model)

  return schema
})
