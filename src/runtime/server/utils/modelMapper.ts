// runtime/server/utils/modelMapper.ts

// @ts-expect-error - #site/schema is an alias defined by the module
import * as schema from '#site/schema'
import { getColumns, type Column, Table, is } from 'drizzle-orm'
import { getTableConfig, SQLiteTable  } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { useRuntimeConfig } from '#imports'

import type { Field, SchemaDefinition } from '#nac/shared/utils/types'
import { NAC_OWNER_KEYS } from './constants'

type ForeignKey = ReturnType<typeof getTableConfig>['foreignKeys'][number]

/**
 * Builds a map of all exported Drizzle tables from the schema.
 * @param {Record<string, any>} schema - The imported schema object containing table definitions and other exports.
 * @returns {Record<string, SQLiteTable>} A mapping of export keys to their corresponding SQLiteTable instances.
 */
export const buildModelTableMap = (): Record<string, SQLiteTable> => {
  return Object.entries(schema).reduce((acc, [key, value]) => {
    if (is(value, SQLiteTable)) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, SQLiteTable>)
}
export const modelTableMap = buildModelTableMap()

/**
 * Iterates over all models in the modelTableMap.
 * @param callback The function to call for each model
 */
export function forEachModel(callback: (name: string, table: SQLiteTable) => void) {
  for (const [name, table] of Object.entries(modelTableMap)) {
    try {
      callback(name, table as SQLiteTable)
    }
    catch {
      // Ignored for now. Could be logged later
    }
  }
}

/**
 * Resolves the property name for a foreign key's source column.
 * @returns The property name or undefined if not found
 */
export function getForeignKeyPropertyName( fk: ForeignKey, columns: Record<string, Column>): string | undefined {
  const dbName = fk.reference().columns[0]?.name
  if (!dbName) return undefined

  return Object.entries(columns).find(
    ([_, c]: [string, Column]) => c.name === dbName,
  )?.[0]
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
export function getSelectableFields(table: SQLiteTable): Record<string, Column> {
  const { apiHiddenFields } = useRuntimeConfig().autoCrud

  const allColumns = getColumns(table)

  const entries = Object.entries(allColumns).filter(
    ([key]) => !apiHiddenFields.includes(key)
  )

  return Object.fromEntries(entries) as Record<string, Column>
}

/**
 * Resolves a model-specific Zod schema that automatically strips
 * NAC_FORM_HIDDEN_FIELDS and coerces technical types.
 */
export function resolveValidatedSchema( table: SQLiteTable, intent: 'insert' | 'patch' = 'insert'): z.ZodObject<z.ZodRawShape> {
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
 * Resolves table relationships for NAC reflection.
 * Maps property keys to target table names.
 */
export function resolveTableRelations(
  table: SQLiteTable, 
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