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
    try {
      callback(modelName, table)
    }
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

/**
 * Selectable fields to give as api response.
 * Used in getRow (/[model]/[id].get.ts) and getRows (/[model]/index.get.ts).
 * @param table The table to query.
 * @returns An object of field names and their values
 * result example: { field1: users.id, field2: users.name, }
 */
export function getSelectableFields(table: Table): Record<string, Column> {
  const { apiHiddenFields } = useRuntimeConfig().autoCrud
  const allColumns = getColumns(table)
  const result: Record<string, Column> = {}

  for (const key in allColumns) {
    if (!apiHiddenFields.includes(key)) {
      const col = allColumns[key]
      if (col) result[key] = col
    }
  }

  return result
}

/**
 * Resolves a model-specific Zod schema that automatically strips
 * NAC_FORM_HIDDEN_FIELDS and coerces technical types.
 */
export function resolveValidatedSchema(table: Table, intent: 'insert' | 'patch' = 'insert'): z.ZodObject<z.ZodRawShape> {
  const { formHiddenFields } = useRuntimeConfig().public.autoCrud

  // 1. Base Schema with Date Coercion
  const baseSchema = createInsertSchema(table, ({ name, column }: { name: string, column: Column }) => {
    // Check columnType for 'timestamp' or 'date' strings
    const isDateColumn = column.columnType.includes('timestamp') || column.columnType.includes('date')

    return {
      [name]: isDateColumn ? z.coerce.date() : undefined,
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
  table: Table,
  includeSystemFields = false,
): Record<string, string> {
  const config = getTableConfig(table)
  const columnsMap = getColumns(table as Table)
  const relations: Record<string, string> = {}

  // 1. Link NAC_OWNER_KEYS to users table
  if (includeSystemFields) {
    for (const key of Object.keys(columnsMap)) {
      if (NAC_OWNER_KEYS.includes(key as typeof NAC_OWNER_KEYS[number])) relations[key] = 'users'
    }
  }

  // 2. Resolve explicit Foreign Keys from Schema
  for (const fk of config.foreignKeys) {
    const targetTable = getTableConfig(fk.reference().foreignTable).name
    const propertyKey = getForeignKeyPropertyName(fk, columnsMap)
    if (propertyKey) relations[propertyKey] = targetTable
  }

  return relations
}

/**
 * Resolves the label field for a model.
 * @param columnNames The names of the columns in the model
 * @returns The name of the label field
 */
export function getLabelField(columnNames: string[]): string {
  const candidates = ['name', 'title', 'label', 'email']
  return candidates.find(n => columnNames.includes(n)) || 'id'
}

const ZOD_TYPE_MAP: Record<string, Field['type']> = {
  ZodDate: 'date',
  ZodNumber: 'number',
  ZodBoolean: 'boolean',
}

const SEMANTIC_CHECK_MAP: Record<string, Field['type']> = {
  email: 'email',
  uuid: 'uuid',
  url: 'url',
}

const TEXTAREA_HINTS = ['content', 'description', 'bio', 'message']

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

  const config = useRuntimeConfig() as unknown as { autoCrud: { apiHiddenFields: string[] }, public: { autoCrud: { formHiddenFields: string[] } } }
  const apiHiddenFields = config.autoCrud.apiHiddenFields
  const formHiddenFields = config.public.autoCrud.formHiddenFields

  const columns = getColumns(table)
  const relations = resolveTableRelations(table, true)
  const shape = createInsertSchema(table).shape

  const fields: Field[] = Object.entries(columns)
    .filter(([name]) => !apiHiddenFields.includes(name))
    .map(([name, col]) => {
      const zodField = shape[name] as z.ZodTypeAny | undefined
      const zodTypeName = (zodField?._def as any)?.typeName

      // 1. Resolve Base Technical Type
      let type: Field['type'] = ZOD_TYPE_MAP[zodTypeName] ?? 'string'

      // 2. Resolve Enums & Semantic Overrides
      const colInternal = col as Column & { enumValues?: string[], config?: { enumValues?: string[] } }
      const enumValues = colInternal.enumValues || colInternal.config?.enumValues
      let selectOptions: string[] | undefined

      if (enumValues) {
        type = 'enum'
        selectOptions = enumValues
      }
      else {
        const checks = (zodField?._def?.checks as unknown as { kind: string }[]) || []
        const semanticMatch = checks.find(c => SEMANTIC_CHECK_MAP[c.kind])

        if (semanticMatch) {
          type = SEMANTIC_CHECK_MAP[semanticMatch.kind]!
        }
        else if (TEXTAREA_HINTS.includes(name)) {
          type = 'textarea'
        }
      }

      return {
        name,
        type,
        selectOptions,
        required: colInternal.notNull ?? false,
        references: relations[name],
        isReadOnly: formHiddenFields.includes(name),
      }
    })

  return {
    resource: modelName,
    labelField: getLabelField(Object.keys(columns)),
    fields,
  }
}
