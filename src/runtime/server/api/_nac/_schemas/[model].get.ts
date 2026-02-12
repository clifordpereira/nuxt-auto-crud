import { eventHandler, getRouterParams } from 'h3'

import { getSchemaDefinition } from '../../../utils/modelMapper'

import { ResourceNotFoundError } from '../../../exceptions'

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event)
  if (!model) throw ResourceNotFoundError

  // should return SchemaDefinition
  const schema = getSchemaDefinition(model)
  if (!schema) throw ResourceNotFoundError

  return schema
})
