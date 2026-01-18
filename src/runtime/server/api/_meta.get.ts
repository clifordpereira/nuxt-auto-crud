// server/api/_meta.get.ts
import { eventHandler } from 'h3'
import { getTableForModel, getAvailableModels } from '../utils/modelMapper'
import { getTableColumns as getDrizzleTableColumns } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import { PROTECTED_FIELDS, HIDDEN_FIELDS } from '../utils/constants'
// @ts-expect-error - 'hub:db' is a virtual alias
import { db } from 'hub:db'
import { ensureAuthenticated } from '../utils/auth'

export default eventHandler(async (event) => {
  await ensureAuthenticated(event)

  const models = getAvailableModels().length > 0
    ? getAvailableModels()
    : Object.keys(db?.query || {})

  const resources = models.map((model) => {
    try {
      const table = getTableForModel(model)
      const columns = getDrizzleTableColumns(table)
      const config = getTableConfig(table)

      // Map columns to fields
      const fields = Object.entries(columns)
        .filter(([name]) => !PROTECTED_FIELDS.includes(name) && !HIDDEN_FIELDS.includes(name))
        .map(([name, col]) => {
          let references = null

          // 1. Check for Foreign Keys via getTableConfig (Robust Drizzle Reflection)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fk = config?.foreignKeys.find((f: any) =>
            f.reference().columns[0].name === col.name,
          )

          if (fk) {
            // @ts-expect-error - Drizzle internals
            references = fk.reference().foreignTable[Symbol.for('drizzle:Name')]
          }
          // 2. Fallback to inline reference config if symbol lookup fails
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          else if ((col as any).referenceConfig?.foreignTable) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const foreignTable = (col as any).referenceConfig.foreignTable
            references = foreignTable[Symbol.for('drizzle:Name')] || foreignTable.name
          }

          // Semantic Normalization
          const semanticType = col.columnType.toLowerCase().replace('sqlite', '')

          return {
            name,
            type: semanticType,
            required: col.notNull || false,
            isEnum: !!col.enumValues,
            options: col.enumValues || null,
            references,
            isRelation: !!references,
          }
        })

      // 3. Implement Clifland Label Heuristic (name > title > email > id)
      const fieldNames = fields.map(f => f.name)
      const labelField = fieldNames.find(n => n === 'name')
        || fieldNames.find(n => n === 'title')
        || fieldNames.find(n => n === 'email')
        || 'id'

      return {
        resource: model,
        endpoint: `/api/${model}`,
        labelField,
        fields,
      }
    }
    catch {
      return null
    }
  }).filter(Boolean)

  return {
    architecture: 'Clifland-NAC',
    version: '1.0.0-agentic',
    resources,
  }
})
