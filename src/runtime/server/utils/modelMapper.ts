import { getColumns, type Column, Table, is } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

import { useRuntimeConfig } from '#imports'

// @ts-expect-error - #nac/schema is an alias defined by the module
import * as schema from '#nac/schema'

import type { Field, SchemaDefinition } from '#nac/shared/utils/types'
import { NAC_OWNER_KEYS } from './constants'

type ForeignKey = ReturnType<typeof getTableConfig>['foreignKeys'][number]

/**
 * Builds a map of all exported Drizzle tables from the schema.
 * @param {Record<string, any>} schema - The imported schema object containing table definitions and other exports.
 * @returns {Record<string, Table>} A mapping of export keys to their corresponding Table instances.
 */
const EXCLUDED_MODELS = ['system_logs', 'migrations', 'internal_config']

export const buildModelTableMap = (): Record<string, Table> => {
  return Object.entries(schema).reduce((acc, [key, value]) => {
    if (is(value, Table) && !EXCLUDED_MODELS.includes(key)) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, Table>)
}
export const modelTableMap = buildModelTableMap()

/**
 * Iterates over all models in the modelTableMap.
 * @param callback The function to call for each model
 */
export function forEachModel(callback: (modelName: string, table: Table) => void) {
  for (const [modelName, table] of Object.entries(modelTableMap)) {
    try { callback(modelName, table) }
    catch { /* TODO: NAC Internal Logger */ }
  }
}

/**
 * Resolves the property name for a foreign key's source column.
 * @returns The property name or undefined if not found
 */
export function getForeignKeyPropertyName(fk: ForeignKey, columns: Record<string, Column>): string | undefined {
  const targetColumnName = fk.reference().columns[0]?.name // TODO: Support composite keys if required in future
  if (!targetColumnName || !columns) return undefined

  for (const key in columns) {
    if (columns[key]?.name === targetColumnName) return key
  }
}

// keep in server/utils itself
// used for CRUD getRow and getRows
/**
 * Selectable fields to give as api response. 
 * Used in getRow (/[model]/[id].get.ts) and getRows (/[model]/index.get.ts).
 * @param table The table to query.
 * @returns An object of field names and their values
 * result example: { field1: users.id, field2: users.name, }
 */
export function getFilteredFields(table: Table, type: 'api' | 'form' | 'dataTable'): Record<string, Column> {
  const config = useRuntimeConfig()
  const allColumns = getColumns(table)
  
  let hiddenFields: string[] = []
  
  if (type === 'api') {
    hiddenFields = config.autoCrud.apiHiddenFields
  } else {
    const configKey = type === 'form' ? 'formHiddenFields' : 'dataTableHiddenFields'
    hiddenFields = config.public.autoCrud[configKey]
  }

  const result: Record<string, Column> = {}

  for (const key in allColumns) {
    const col = allColumns[key]
    if (col && !hiddenFields.includes(key)) {
      result[key] = col
    }
  }

  return result
}

/**
 * Resolves a model-specific Zod schema that automatically strips
 * NAC_FORM_HIDDEN_FIELDS and coerces technical types.
 */
export function resolveValidatedSchema( table: Table, intent: 'insert' | 'patch' = 'insert'): z.ZodObject<z.ZodRawShape> {
  const { formHiddenFields } = useRuntimeConfig().public.autoCrud

  // 1. Base Schema with Date Coercion
  const baseSchema = createInsertSchema(table, ({ name, column }: { name: string; column: Column }) => {
    // Check columnType for 'timestamp' or 'date' strings
    const isDateColumn = column.columnType.includes('timestamp') || column.columnType.includes('date')

    return {
      [name]: isDateColumn ? z.coerce.date() : undefined
    }
  })

  // 2. Filter NAC protected/hidden fields
  const columnNames = Object.keys(getColumns(table))
  const fieldsToOmit = formHiddenFields.filter(f => columnNames.includes(f))
  const sanitizedSchema = baseSchema.omit(Object.fromEntries(fieldsToOmit.map(f => [f, true])))

  // 3. Apply intent
  return (intent === 'patch' ? sanitizedSchema.partial() : sanitizedSchema) as z.ZodObject<z.ZodRawShape>
}



/**
 * Extracts foreign key relationships for a specific table.
 * @returns Record<string, string> 
 * 
 * @example
 * { userId: 'users', categoryId: 'categories' }
 */
export function getTableRelations(table: Table): Record<string, string> {
  const { foreignKeys } = getTableConfig(table)
  const columnsMap = getColumns(table as Table)
  const relations: Record<string, string> = {}

  for (const fk of foreignKeys) {
    // 1. Get the target (referenced) table name
    const remoteTable = fk.reference().foreignTable
    const targetTableName = getTableConfig(remoteTable).name

    // 2. Map the local column name to that table
    // We use the first column in the reference since NAC assumes single-column FKs
    const localColumnName = fk.reference().columns[0]?.name

    if (localColumnName) {
      // Find the property key (TS name) that matches the DB column name
      const propertyKey = Object.entries(columnsMap).find(
        ([_, col]) => col.name === localColumnName
      )?.[0]

      if (propertyKey) {
        relations[propertyKey] = targetTableName
      }
    }
  }

  return relations
}

/**
 * Resolves table relationships for NAC reflection.
 * Maps property keys to target table names.
 */
export function resolveTableRelations(
  table: Table, 
  includeSystemFields = false
): Record<string, string> {
  const config = getTableConfig(table)
  const columnsMap = getColumns(table as Table)
  const propertyKeys = Object.keys(columnsMap)
  const relations: Record<string, string> = {}

  // 1. Link NAC_OWNER_KEYS to users table
  if (includeSystemFields) {
    const systemFields = new Set(NAC_OWNER_KEYS)
    for (const key of propertyKeys) {
      if (systemFields.has(key)) {
        relations[key] = 'users'
      }
    }
  }

  // 2. Resolve explicit Foreign Keys from Schema
  for (const fk of config.foreignKeys) {
    const targetTable = getTableConfig(fk.reference().foreignTable).name;
    const propertyKey = getForeignKeyPropertyName(fk, columnsMap)

    if (propertyKey) {
      relations[propertyKey] = targetTable
    }
  }

  return relations
}

export function getLabelField(columnNames: string[]): string {
  const candidates = ['name', 'title', 'email', 'label', 'subject']
  return candidates.find(n => columnNames.includes(n)) || 'id'
}

/**
 * Builds a complete SchemaDefinition for a model.
 * - Filters out hidden fields
 * - Marks protected fields as read-only
 * - Infers types from Drizzle columns
 * - Resolves foreign key relations
 */
export function getSchemaDefinition(modelName: string): SchemaDefinition {
  const table = modelTableMap[modelName]
  if (!table) throw new Error(`Model ${modelName} not found`)

  const columnEntries = Object.entries(getColumns(table))
  const columnNames = columnEntries.map(([name]) => name)
  const labelField = getLabelField(columnNames)
  const relations = resolveTableRelations(table, true)
  
  const config = useRuntimeConfig()
  const hiddenFields = config.autoCrud.apiHiddenFields
  const protectedFields = config.public.autoCrud.formHiddenFields

  const zodSchema = createInsertSchema(table)
  const shape = zodSchema.shape

  const fields: Field[] = columnEntries
    .filter(([name]) => !hiddenFields.includes(name))
    .map(([name, column]) => {
      const zodType = shape[name]
      const col = column as any
      
      // Map Drizzle types via Zod shape
      let type = 'string'
      if (zodType instanceof z.ZodDate || (zodType as any)._def?.typeName === 'ZodDate') {
        type = 'date'
      } else if (zodType instanceof z.ZodNumber) {
        type = 'number'
      } else if (zodType instanceof z.ZodBoolean) {
        type = 'boolean'
      }

      return {
        name,
        type,
        required: col?.notNull ?? false,
        references: relations[name],
        isReadOnly: protectedFields.includes(name),
      }
    })

  return { resource: modelName, labelField, fields }
}