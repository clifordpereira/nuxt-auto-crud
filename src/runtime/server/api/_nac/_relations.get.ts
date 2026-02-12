import { eventHandler } from 'h3'

import { forEachModel, resolveTableRelations } from '../../utils/modelMapper'

/**
 * Returns the relations for all models in the database.
 * @returns {Record<string, Record<string, string>>} A mapping of model names to their relations.
 */
export default eventHandler(async () => {
  const relations: Record<string, Record<string, string>> = {}

  forEachModel((tableName, table) => {
    relations[tableName] = resolveTableRelations(table)
  })
  return relations
})
