// runtime/server/utils/modelMapper.ts

// @ts-expect-error - #site/schema is an alias defined by the module
import * as schema from '#site/schema'
import pluralize from 'pluralize'
import { pascalCase } from 'scule'
import { getColumns, type Column, Table } from 'drizzle-orm'
import { getTableConfig, type SQLiteTable } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { z } from 'zod'

import type { Field, SchemaDefinition } from '#nac/shared/utils/types'
import { useRuntimeConfig } from '#app'
import { NAC_OWNER_KEYS, NAC_FORM_HIDDEN_FIELDS } from './constants'
import { ResourceNotFoundError, ValidationError } from '../exceptions'

export const customUpdatableFields: Record<string, string[]> = {}

type ForeignKey = ReturnType<typeof getTableConfig>['foreignKeys'][number]


/**
 * Builds a map of all exported Drizzle tables from the schema.
 */
export const buildModelTableMap = (): Record<string, SQLiteTable> => {
  return Object.entries(schema).reduce((acc, [key, value]) => {
    if (value && typeof value === 'object' && Table.is(value)) {
      acc[key] = value as SQLiteTable
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

/**
 * Returns an array of updatable fields for a given model.
 * @param modelName The name of the model
 * @returns An array of field names
 */
// move to shared/utils
export function getUpdatableFields(modelName: string): string[] {
  const {formHiddenFields} = useRuntimeConfig().public.autoCrud
  const table = modelTableMap[modelName]
  if (!table) return []

  return Object.keys(getColumns(table as Table)).filter(
    (key) => !formHiddenFields.includes(key)
  )
}

// keep in server/utils itself
// used for CRUD getRow and getRows
/**
 * Selectable fields to give as api response.
 * @param table The table to query.
 * @returns An object of field names and their values
 */
export function getSelectableFields(table: SQLiteTable): Record<string, any> {
  const { apiHiddenFields } = useRuntimeConfig().autoCrud

  const allColumns = getColumns(table)

  return Object.fromEntries(
    Object.entries(allColumns).filter(([key]) => !apiHiddenFields.includes(key))
  )
}

/**
 * Filters and coerces data for updates, handling timestamp conversion.
 */
export function filterUpdatableFields(
  modelName: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const table = modelTableMap[modelName]
  if (!table) return {}

  const schema = createUpdateSchema(table).partial()
  const result = schema.safeParse(data)
  if (!result.success) throw new ValidationError(modelName)

  const allowedFields = getUpdatableFields(modelName)
  const filtered: Record<string, any> = {}

  for (const key of allowedFields) {
    if (result.data[key] !== undefined) {
      filtered[key] = result.data[key]
    }
  }

  return filtered
}

export function getModelSingularName(modelName: string): string {
  const singular = pluralize.singular(modelName)
  return pascalCase(singular)
}

export function getModelPluralName(modelName: string): string {
  return pluralize.plural(modelName).toLowerCase()
}

export function getAvailableModels(): string[] {
  return Object.keys(modelTableMap)
}
// config resolver

/**
 * Sanitizes resource data based on guest mode and configuration.
 * - Always filters globally excluded HIDDEN_FIELDS.
 * - If isGuest=true AND resource has explicit public fields configured, filters to Allowlist.
 */
export function sanitizeResource(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const hidden = useRuntimeConfig().autoCrud.apiHiddenFields
  const filtered: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (hidden.includes(key)) continue
    filtered[key] = value
  }

  return filtered
}

/**
 * Derives Zod schema via drizzle-zod, omitting server-managed and protected fields.
 */
export function getZodSchema(modelName: string, type: 'insert' | 'patch' = 'insert'): z.ZodObject<z.ZodRawShape> {
  const table = modelTableMap[modelName]
  if (!table) throw new ResourceNotFoundError

  const tableColumns = getColumns(table)
  const columnNames = Object.keys(tableColumns)

  // 1. Generate schema with automatic Date coercion
  const schema = createInsertSchema(table, ({ name, column }) => ({
    [name]: column.columnType.includes('timestamp') || column.dataType === 'date' 
      ? z.coerce.date() 
      : undefined // Fallback to default drizzle-zod inference
  }))

  // 2. Handle Patch (Partial)
  if (type === 'patch') {
    return schema.partial() as z.ZodObject<z.ZodRawShape>
  }

  // 3. Handle Insert (Omit protected/hidden fields)
  const OMIT_ON_CREATE = [...getProtectedFields(), ...getHiddenFields(modelName)]
  const fieldsToOmit: Record<string, true> = {}

  for (const field of OMIT_ON_CREATE) {
    if (columnNames.includes(field)) {
      fieldsToOmit[field] = true
    }
  }

  return schema.omit(fieldsToOmit) as z.ZodObject<z.ZodRawShape>
}

export function formatResourceResult(
  model: string,
  data: Record<string, unknown> | Record<string, unknown>[] | null | undefined,
): Record<string, unknown> | Record<string, unknown>[] | null | undefined {
  if (!data) return data

  const sanitize = (item: Record<string, unknown>) => sanitizeResource(model, item)

  return Array.isArray(data) ? data.map(sanitize) : sanitize(data)
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


export function getRelations(): Record<string, Record<string, string>> {
  const relations: Record<string, Record<string, string>> = {}
  const models = getAvailableModels()

  for (const model of models) {
    const table = modelTableMap[model] as SQLiteTable
    relations[model] = resolveTableRelations(table, false)
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