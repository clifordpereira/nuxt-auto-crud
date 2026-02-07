// runtime/server/utils/modelMapper.ts
// @ts-expect-error - #site/schema is an alias defined by the module
import * as schema from '#site/schema'
import pluralize from 'pluralize'
import { pascalCase } from 'scule'
import {
  getTableColumns as getDrizzleTableColumns,
  getTableName,
  type Column,
  type Table,
} from 'drizzle-orm'
import { getTableConfig, type SQLiteTable } from 'drizzle-orm/sqlite-core'
import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const customUpdatableFields: Record<string, string[]> = {}
export const customHiddenFields: Record<string, string[]> = {}

type ForeignKey = ReturnType<typeof getTableConfig>['foreignKeys'][number]

/**
 * Builds a map of all exported Drizzle tables from the schema.
 */
function buildModelTableMap(): Record<string, unknown> {
  const tableMap: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(schema)) {
    if (value && typeof value === 'object') {
      try {
        const tableName = getTableName(value as Table)
        if (tableName) {
          tableMap[key] = value
        }
      }
      catch {
        // Not a table
      }
    }
  }

  return tableMap
}

export const modelTableMap = buildModelTableMap()

/**
 * @throws 404 if modelName is not found in tableMap.
 */
export function getTableForModel(modelName: string): SQLiteTable {
  const table = modelTableMap[modelName]

  if (!table) {
    const availableModels = Object.keys(modelTableMap).join(', ')
    throw createError({
      statusCode: 404,
      message: `Model '${modelName}' not found. Available models: ${availableModels}`,
    })
  }

  return table as SQLiteTable
}

export function getTableColumns(table: Table): string[] {
  try {
    const columns = getDrizzleTableColumns(table)
    return Object.keys(columns)
  }
  catch (e) {
    console.error('[getTableColumns] Error getting columns:', e)
    return []
  }
}

/**
 * Extracts the target table name from a Drizzle foreign key.
 */
export function getTargetTableName(fk: ForeignKey): string {
  // @ts-expect-error - Drizzle internals
  return fk.reference().foreignTable[Symbol.for('drizzle:Name')]
}

/**
 * Resolves the property name for a foreign key's source column.
 * @returns The property name or undefined if not found
 */

export function getForeignKeyPropertyName(
  fk: ForeignKey,
  columns: Record<string, Column>,
): string | undefined {
  const sourceColName = fk.reference().columns[0]?.name
  return Object.entries(columns).find(
    ([_, c]: [string, Column]) => c.name === sourceColName,
  )?.[0]
}

export function getUpdatableFields(modelName: string): string[] {
  if (customUpdatableFields[modelName]) {
    return customUpdatableFields[modelName]
  }

  const table = modelTableMap[modelName]
  if (!table) return []

  const allColumns = getTableColumns(table as Table)
  return allColumns.filter(
    col => !getProtectedFields().includes(col) && !getHiddenFields(modelName).includes(col),
  )
}

/**
 * Detects if a column represents a date or timestamp.
 */
export function isDateColumn(column: Column, key: string): boolean {
  const col = column as unknown as { name?: string, dataType?: string, mode?: string, columnType?: string }
  const name = col.name || key
  const isDateName
    = name.endsWith('_at')
      || name.endsWith('At')
      || name.endsWith('Login')
      || name.endsWith('Date')
      || name.endsWith('_date')

  return (
    col.dataType === 'date'
    || col.mode === 'timestamp'
    || col.columnType?.toLowerCase().includes('timestamp')
    || ((col.dataType === 'string' || col.dataType === 'number' || col.columnType?.includes('Integer')) && isDateName)
  ) ?? false
}

/**
 * Filters and coerces data for updates, handling timestamp conversion.
 */
export function filterUpdatableFields(
  modelName: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const allowedFields = getUpdatableFields(modelName)
  const filtered: Record<string, unknown> = {}
  const table = modelTableMap[modelName]
  const columns = table ? getDrizzleTableColumns(table as Table) : {}

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      let value = data[field]
      const column = columns[field]

      if (column && isDateColumn(column, field) && typeof value === 'string') {
        value = new Date(value)
      }

      filtered[field] = value
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

export function getHiddenFields(modelName: string): string[] {
  const { autoCrud } = useRuntimeConfig().public
  const globalHidden = autoCrud.hiddenFields || []
  const custom = customHiddenFields[modelName] || []

  return [...globalHidden, ...custom]
}

export function getProtectedFields(): string[] {
  const { autoCrud } = useRuntimeConfig().public
  return autoCrud.protectedFields || []
}

export function getSystemUserFields(): string[] {
  const { autoCrud } = useRuntimeConfig().public
  return autoCrud.systemUserFields || []
}

export function getPublicColumns(modelName: string): string[] | undefined {
  const { resources } = useRuntimeConfig().public.autoCrud
  return resources?.[modelName]
}

/**
 * Sanitizes resource data based on guest mode and configuration.
 * - Always filters globally excluded HIDDEN_FIELDS.
 * - If isGuest=true AND resource has explicit public fields configured, filters to Allowlist.
 */
export function sanitizeResource(
  modelName: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const hidden = getHiddenFields(modelName)
  const filtered: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    // Drop fields in global HIDDEN_FIELDS or system-level exclusions
    if (hidden.includes(key) || key === 'deletedAt') {
      continue
    }
    filtered[key] = value
  }

  return filtered
}

/**
 * Derives Zod schema via drizzle-zod, omitting server-managed and protected fields.
 */

export function getZodSchema(
  modelName: string,
  type: 'insert' | 'patch' = 'insert',
): z.ZodObject<z.ZodRawShape> {
  const table = getTableForModel(modelName)
  const columns = getDrizzleTableColumns(table as Table)

  // Custom schema overrides for date coercion
  const customSchema: Record<string, z.ZodTypeAny> = {}

  for (const [key, column] of Object.entries(columns)) {
    if (isDateColumn(column, key)) {
      customSchema[key] = z.coerce.date()
      if (!column.notNull) {
        customSchema[key] = customSchema[key].nullable().optional()
      }
    }
  }

  const schema = createInsertSchema(table, customSchema)

  if (type === 'patch') {
    return schema.partial() as z.ZodObject<z.ZodRawShape>
  }

  const OMIT_ON_CREATE = [...getProtectedFields(), ...getHiddenFields(modelName)]
  const fieldsToOmit: Record<string, true> = {}

  OMIT_ON_CREATE.forEach((field) => {
    if (columns[field]) {
      fieldsToOmit[field] = true
    }
  })

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
 * Shared utility to extract relations from a Drizzle table
 */
export function resolveTableRelations(table: SQLiteTable, includeSystemFields = false): Record<string, string> {
  const config = getTableConfig(table)
  const columns = getDrizzleTableColumns(table as Table)
  const relations: Record<string, string> = {}

  // Resolve implicit user relations
  if (includeSystemFields) {
    const systemFields = getSystemUserFields()
    for (const key of Object.keys(columns)) {
      if (systemFields.includes(key)) relations[key] = 'users'
    }
  }

  // Resolve explicit Foreign Keys
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config.foreignKeys.forEach((fk: any) => {
    const targetTableName = getTargetTableName(fk)
    const propertyKey = getForeignKeyPropertyName(fk, columns)

    if (propertyKey) {
      relations[propertyKey] = targetTableName
    }
  })

  return relations
}

export function getRelations(): Record<string, Record<string, string>> {
  const relations: Record<string, Record<string, string>> = {}
  const models = getAvailableModels()

  for (const model of models) {
    const table = getTableForModel(model)
    relations[model] = resolveTableRelations(table, false)
  }

  return relations
}

export function getLabelField(columnNames: string[]): string {
  const candidates = ['name', 'title', 'email', 'label', 'subject']
  return candidates.find(n => columnNames.includes(n)) || 'id'
}

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
