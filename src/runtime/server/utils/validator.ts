import { z } from 'zod'
import { createSchemaFactory } from 'drizzle-zod'
import { getColumns, type Table } from 'drizzle-orm'
import { useRuntimeConfig } from '#imports'

// Create a factory with explicit date coercion
const { createInsertSchema } = createSchemaFactory({ coerce: { date: true } })

export function resolveValidatedSchema(
  table: Table, 
  intent: 'insert' | 'patch' = 'insert'
) {
  const { formHiddenFields } = useRuntimeConfig().public.autoCrud
  const columns = getColumns(table)

  const baseSchema = createInsertSchema(table, Object.fromEntries(
    Object.entries(columns)
      .filter(([_, col]) => (col as any).mode === 'timestamp' || (col as any).mode === 'date')
      .map(([name, col]) => [
        name, 
        col.notNull ? z.coerce.date() : z.coerce.date().nullable().optional()
      ])
  ) as any)

  const columnNames = Object.keys(columns)
  const fieldsToOmit = formHiddenFields.filter(f => columnNames.includes(f))
  
  const sanitizedSchema = baseSchema.omit(
    Object.fromEntries(fieldsToOmit.map(f => [f, true])) as any
  )

  return (intent === 'patch' ? sanitizedSchema.partial() : sanitizedSchema)
}