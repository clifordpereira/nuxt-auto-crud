// server/utils/schema.ts
import { getColumns } from 'drizzle-orm'
import { getSchemaDefinition, resolveValidatedSchema } from './modelMapper'
import type { ZodType } from 'zod'
import type { Column } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'

import type { Field, SchemaDefinition } from '#nac/shared/utils/types'

/**
 * Enhanced schema builder that uses getSchemaDefinition() as base
 * and enriches field types with Zod semantic hints and textarea detection.
 */
export function drizzleTableToFields(table: SQLiteTable, resourceName: string): SchemaDefinition {
  const baseSchema = getSchemaDefinition(resourceName)
  
  const columns = getColumns(table)
  const zodSchema = resolveValidatedSchema(table, 'insert')

  // Enhance each field with semantic type hints
  const enhancedFields: Field[] = baseSchema.fields.map((field) => {
    const column = columns[field.name] as Column | undefined
    const zodField = (zodSchema.shape as Record<string, ZodType>)[field.name]

    if (!column) return field

    const { type, selectOptions } = enhanceFieldType(column, zodField, field.type)

    return {
      ...field,
      type,
      selectOptions,
    }
  })

  return {
    ...baseSchema,
    fields: enhancedFields,
  }
}

/**
 * Enhances base field type with Zod semantic hints and domain-specific patterns.
 */
function enhanceFieldType(
  column: Column,
  zodField?: ZodType,
  baseType?: string,
): { type: string, selectOptions?: string[] } {
  // 1. Drizzle Enums (highest priority)
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

  // 3. Textarea detection (domain-specific)
  const { name } = column
  if (['content', 'description', 'bio', 'message'].includes(name)) {
    return { type: 'textarea' }
  }

  // 4. Fallback to base type from modelMapper
  return { type: baseType || 'string' }
}
