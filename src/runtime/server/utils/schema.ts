// server/utils/schema.ts
import { getTableColumns } from 'drizzle-orm'
import {
  getZodSchema,
  modelTableMap,
  getHiddenFields,
  getProtectedFields,
  resolveTableRelations,
  isDateColumn,
  getLabelField,
  forEachModel,
} from './modelMapper'
import type { ZodType } from 'zod'
import type { Column } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'

import type { Field, SchemaDefinition } from '#nac/shared/utils/types'

export function drizzleTableToFields(table: SQLiteTable, resourceName: string): SchemaDefinition {
  const columns = getTableColumns(table)
  const fields: Field[] = []

  const zodSchema = getZodSchema(resourceName, 'insert')
  const relations = resolveTableRelations(table, true) // Get all relations including system ones

  for (const [key, col] of Object.entries(columns)) {
    if (getHiddenFields(resourceName).includes(key)) continue

    const column = col as Column
    const zodField = (zodSchema.shape as Record<string, ZodType>)[key]

    const { type, selectOptions } = mapColumnType(column, zodField)

    fields.push({
      name: key,
      type,
      required: column.notNull,
      selectOptions,
      isReadOnly: getProtectedFields().includes(key),
      references: relations[key], // Use the resolved relations map
    })
  }

  const fieldNames = fields.map(f => f.name)
  const labelField = getLabelField(fieldNames)

  return { resource: resourceName, labelField, fields }
}

function mapColumnType(
  column: Column,
  zodField?: ZodType,
): { type: string, selectOptions?: string[] } {
  // 1. Drizzle Enums
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enumValues = (column as any).enumValues || (column as any).config?.enumValues
  if (enumValues) return { type: 'enum', selectOptions: enumValues }

  // 2. Zod Semantic Hints (The "Agentic" advantage)
  if (zodField?._def?.checks) {
    const checks = zodField._def.checks as unknown as { kind: string }[]
    if (checks.some(c => c.kind === 'email')) return { type: 'email' }
    if (checks.some(c => c.kind === 'uuid')) return { type: 'uuid' }
    if (checks.some(c => c.kind === 'url')) return { type: 'url' }
  }

  const { dataType, columnType, name } = column

  if (dataType === 'boolean') return { type: 'boolean' }
  if (isDateColumn(column, name)) return { type: 'date' }
  if (
    dataType === 'number'
    || columnType.includes('Integer')
    || columnType.includes('Real')
  ) {
    return { type: 'number' }
  }
  if (['content', 'description', 'bio', 'message'].includes(name))
    return { type: 'textarea' }

  return { type: 'string' }
}

export async function getSchemaRelations() {
  const relations: Record<string, Record<string, string>> = {}

  forEachModel((tableName, table) => {
    relations[tableName] = resolveTableRelations(table, true)
  })
  return relations
}

export async function getAllSchemas() {
  const schemas: Record<string, SchemaDefinition> = {}

  forEachModel((tableName, table) => {
    schemas[tableName] = drizzleTableToFields(table, tableName)
  })
  return schemas
}

export async function getSchema(tableName: string) {
  const table = modelTableMap[tableName]
  return table ? drizzleTableToFields(table as SQLiteTable, tableName) : undefined
}
