// runtime/server/utils/modelMapper.ts
// @ts-ignore - #site/schema is an alias defined by the module
import * as schema from '#site/schema'
import pluralize from 'pluralize'
import { pascalCase } from 'scule'

/**
 * Fields that should never be updatable via PATCH requests
 */
const PROTECTED_FIELDS = ['id', 'createdAt', 'created_at']

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
 * Automatically builds a map of all exported tables from the schema
 * No manual configuration needed!
 */
function buildModelTableMap(): Record<string, any> {
  const tableMap: Record<string, any> = {}
  
  // Iterate through all exports from schema
  for (const [key, value] of Object.entries(schema)) {
    // Check if it's a Drizzle table
    // Drizzle tables have specific properties we can check
    if (value && typeof value === 'object') {
      // Check for common Drizzle table properties
      const hasTableSymbol = Symbol.for('drizzle:Name') in value
      const hasUnderscore = '_' in value
      const hasTableConfig = 'table' in value || '$inferSelect' in value
      
      if (hasTableSymbol || hasUnderscore || hasTableConfig) {
        tableMap[key] = value
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
export function getTableForModel(modelName: string) {
  const table = modelTableMap[modelName]
  
  if (!table) {
    const availableModels = Object.keys(modelTableMap).join(', ')
    throw createError({
      statusCode: 404,
      message: `Model '${modelName}' not found. Available models: ${availableModels}`,
    })
  }
  
  return table
}

/**
 * Auto-detects updatable fields for a table
 * Returns all fields except protected ones (id, createdAt, etc.)
 */
function getTableColumns(table: any): string[] {
  if (!table || !table._) return []
  
  const columns: string[] = []
  
  // Get columns from the table definition
  if (table._.columns) {
    for (const [columnName] of Object.entries(table._.columns)) {
      columns.push(columnName)
    }
  }
  
  return columns
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
export function filterUpdatableFields(modelName: string, data: Record<string, any>): Record<string, any> {
  const allowedFields = getUpdatableFields(modelName)
  const filtered: Record<string, any> = {}
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      filtered[field] = data[field]
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
