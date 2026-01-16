// runtime/server/utils/modelMapper.ts
// @ts-expect-error - #site/schema is an alias defined by the module
import * as schema from '#site/schema'
import pluralize from 'pluralize'
import { pascalCase } from 'scule'
import { getTableColumns as getDrizzleTableColumns, getTableName } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'
import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { createInsertSchema } from 'drizzle-zod'
import type { z } from 'zod'

/**
 * Fields that should never be updatable via PATCH requests
 */
const PROTECTED_FIELDS = ['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt']

/**
 * Fields that should never be returned in API responses
 */
const HIDDEN_FIELDS = ['password', 'secret', 'token']

/**
 * Custom updatable fields configuration (optional)
 * Only define here if you want to override the auto-detection
 *
 * Example:
 * export const customUpdatableFields: Record<string, string[]> = {
 *   users: ['name', 'avatar'], // Only these fields can be updated
 * }
 */
export const customUpdatableFields: Record<string, string[]> = {
  // Add custom field restrictions here if needed
  // By default, all fields except PROTECTED_FIELDS are updatable
}

/**
 * Custom hidden fields configuration (optional)
 * Only define here if you want to override the default hidden fields
 */
export const customHiddenFields: Record<string, string[]> = {
  // Add custom hidden fields here if needed
}

/**
 * Automatically builds a map of all exported tables from the schema
 * No manual configuration needed!
 */
function buildModelTableMap(): Record<string, unknown> {
  const tableMap: Record<string, unknown> = {}

  // Iterate through all exports from schema
  for (const [key, value] of Object.entries(schema)) {
    // Check if it's a Drizzle table
    if (value && typeof value === 'object') {
      try {
        // getTableName returns the table name for valid tables, and undefined/null for others (like relations)
        // This is a more robust check than checking for properties
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tableName = getTableName(value as any)
        if (tableName) {
          tableMap[key] = value
        }
      }
      catch {
        // Ignore if it throws (not a table)
      }
    }
  }

  return tableMap
}

/**
 * Auto-generated model table map
 * Automatically includes all tables from schema
 */
export const modelTableMap = buildModelTableMap()

/**
 * Gets the table for a given model name
 * @param modelName - The name of the model (e.g., 'users', 'products')
 * @returns The corresponding database table
 * @throws Error if model is not found
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

/**
 * Auto-detects updatable fields for a table
 * Returns all fields except protected ones (id, createdAt, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTableColumns(table: any): string[] {
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
 * Gets the updatable fields for a model
 * @param modelName - The name of the model
 * @returns Array of field names that can be updated
 */
export function getUpdatableFields(modelName: string): string[] {
  // Check if custom fields are defined for this model
  if (customUpdatableFields[modelName]) {
    return customUpdatableFields[modelName]
  }

  // Auto-detect from table schema
  const table = modelTableMap[modelName]

  if (!table) return []

  const allColumns = getTableColumns(table)

  // Filter out protected fields
  return allColumns.filter(col => !PROTECTED_FIELDS.includes(col))
}

/**
 * Filters an object to only include updatable fields for a model
 * @param modelName - The name of the model
 * @param data - The data object to filter
 * @returns Filtered object with only updatable fields
 */
export function filterUpdatableFields(modelName: string, data: Record<string, unknown>): Record<string, unknown> {
  const allowedFields = getUpdatableFields(modelName)
  const filtered: Record<string, unknown> = {}
  const table = modelTableMap[modelName]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = table ? getDrizzleTableColumns(table as any) : {}

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      let value = data[field]
      const column = columns[field]

      // Coerce timestamp fields to Date objects if they are strings
      if (column && column.mode === 'timestamp' && typeof value === 'string') {
        value = new Date(value)
      }

      filtered[field] = value
    }
  }

  return filtered
}

/**
 * Gets the singular name for a model (for error messages)
 * Uses pluralize library for accurate singular/plural conversion
 * @param modelName - The plural model name
 * @returns The singular name in PascalCase
 */
export function getModelSingularName(modelName: string): string {
  const singular = pluralize.singular(modelName)
  return pascalCase(singular)
}

/**
 * Gets the plural name for a model
 * @param modelName - The model name (singular or plural)
 * @returns The plural name
 * @return The plural name
 */
export function getModelPluralName(modelName: string): string {
  return pluralize.plural(modelName)
}

/**
 * Lists all available models
 * @returns Array of model names
 */
export function getAvailableModels(): string[] {
  return Object.keys(modelTableMap)
}

/**
 * Gets the hidden fields for a model
 * @param modelName - The name of the model
 * @returns Array of field names that should be hidden
 */
export function getHiddenFields(modelName: string): string[] {
  // Check if custom hidden fields are defined for this model
  if (customHiddenFields[modelName]) {
    return customHiddenFields[modelName]
  }

  return HIDDEN_FIELDS
}

/**
 * Gets the public columns for a model
 * @param modelName - The name of the model
 * @returns Array of field names that are public (or undefined if all are public)
 */
export function getPublicColumns(modelName: string): string[] | undefined {
  const { resources } = useRuntimeConfig().autoCrud
  // Runtime config structure now matches simple key-value
  return resources?.[modelName]
}

/**
 * Filters an object to only include public columns (if configured)
 * @param modelName - The name of the model
 * @param data - The data object to filter
 * @returns Filtered object
 */
export function filterPublicColumns(modelName: string, data: Record<string, unknown>): Record<string, unknown> {
  const publicColumns = getPublicColumns(modelName)

  // If no public columns configured, return all (except hidden)
  if (!publicColumns) {
    return filterHiddenFields(modelName, data)
  }

  const filtered: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    // Must be in publicColumns AND not in hidden fields (double safety)
    if (publicColumns.includes(key) && !getHiddenFields(modelName).includes(key)) {
      filtered[key] = value
    }
  }

  return filtered
}

/**
 * Filters an object to exclude hidden fields
 * @param modelName - The name of the model
 * @param data - The data object to filter
 * @returns Filtered object without hidden fields
 */
export function filterHiddenFields(modelName: string, data: Record<string, unknown>): Record<string, unknown> {
  const hiddenFields = getHiddenFields(modelName)
  const filtered: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (!hiddenFields.includes(key)) {
      filtered[key] = value
    }
  }

  return filtered
}

/**
 * Gets a Zod schema for a model using drizzle-zod
 * @param modelName - The name of the model
 * @param type - 'insert' (full) or 'patch' (partial)
 * @returns Zod schema
 */
export function getZodSchema(modelName: string, type: 'insert' | 'patch' = 'insert'): z.ZodObject<any> {
  const table = getTableForModel(modelName)
  const schema = createInsertSchema(table)

  if (type === 'patch') {
    return schema.partial() as z.ZodObject<any>
  }

  // Fields to omit on creation (managed by server)
  const OMIT_ON_CREATE = [
    ...PROTECTED_FIELDS,
    'createdBy',
    'updatedBy',
    'created_by',
    'updated_by',
    'deletedAt',
    'deleted_at',
    'deletedBy',
    'deleted_by',
  ]

  const columns = getDrizzleTableColumns(table)
  const fieldsToOmit: Record<string, boolean> = {}

  OMIT_ON_CREATE.forEach((field) => {
    if (columns[field]) {
      fieldsToOmit[field] = true
    }
  })

  return (schema as any).omit(fieldsToOmit)
}
