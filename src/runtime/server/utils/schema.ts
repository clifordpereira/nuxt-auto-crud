import { getColumns, type Column, Table, is } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

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
