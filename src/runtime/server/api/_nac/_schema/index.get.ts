import { eventHandler } from 'h3'

import { forEachModel } from '../../../utils/modelMapper'
import { drizzleTableToFields } from '../../../utils/schema'
import type { SchemaDefinition } from '#nac/shared/utils/types'

/**
 * Returns the schema definition for all models in the database.
 * @returns {Record<string, SchemaDefinition>} A mapping of model names to their schema definitions.
 */
export default eventHandler(async () => {
  const schemas: Record<string, SchemaDefinition> = {}

  forEachModel((tableName, table) => {
    schemas[tableName] = drizzleTableToFields(table, tableName)
  })
  return schemas
})
