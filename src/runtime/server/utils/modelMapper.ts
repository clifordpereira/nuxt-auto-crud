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

import { PROTECTED_FIELDS, HIDDEN_FIELDS } from './constants'

export const customUpdatableFields: Record<string, string[]> = {}
export const customHiddenFields: Record<string, string[]> = {}

/**
 * Builds a map of all exported Drizzle tables from the schema.
 */
function buildModelTableMap(): Record<string, unknown> {
  const tableMap: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(schema)) {
    if (value && typeof value === 'object') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tableName = getTableName(value as any)
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

export function getUpdatableFields(modelName: string): string[] {
  if (customUpdatableFields[modelName]) {
    return customUpdatableFields[modelName]
  }

  const table = modelTableMap[modelName]
  if (!table) return []

  const allColumns = getTableColumns(table)
  return allColumns.filter(col => !PROTECTED_FIELDS.includes(col) && !HIDDEN_FIELDS.includes(col))
}

/**
 * Filters and coerces data for updates, handling timestamp conversion.
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

      if (column && column.mode === 'timestamp' && typeof value === 'string') {
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
  return pluralize.plural(modelName)
}

export function getAvailableModels(): string[] {
  return Object.keys(modelTableMap)
}

export function getHiddenFields(modelName: string): string[] {
  return customHiddenFields[modelName] ?? HIDDEN_FIELDS
}

export function getPublicColumns(modelName: string): string[] | undefined {
  const { resources } = useRuntimeConfig().autoCrud
  return resources?.[modelName]
}

/**
 * Restricts payload to runtimeConfig resource whitelist and filters hidden fields.
 */
export function filterPublicColumns(modelName: string, data: Record<string, unknown>): Record<string, unknown> {
  const publicColumns = getPublicColumns(modelName)

  if (!publicColumns) {
    return filterHiddenFields(modelName, data)
  }

  const filtered: Record<string, unknown> = {}
  const hidden = getHiddenFields(modelName)

  for (const [key, value] of Object.entries(data)) {
    if (publicColumns.includes(key) && !hidden.includes(key)) {
      filtered[key] = value
    }
  }

  return filtered
}

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
 * Generates Zod schema via drizzle-zod, omitting server-managed and protected fields.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getZodSchema(modelName: string, type: 'insert' | 'patch' = 'insert'): z.ZodObject<any, any> {
  const table = getTableForModel(modelName)
  const schema = createInsertSchema(table)

  if (type === 'patch') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return schema.partial() as z.ZodObject<any, any>
  }

  const OMIT_ON_CREATE = [
    ...PROTECTED_FIELDS,
    ...HIDDEN_FIELDS,
  ]

  const columns = getDrizzleTableColumns(table)
  const fieldsToOmit: Record<string, true> = {}

  OMIT_ON_CREATE.forEach((field) => {
    if (columns[field]) {
      fieldsToOmit[field] = true
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (schema as any).omit(fieldsToOmit)
}
