import { z } from 'zod'
import { createSchemaFactory } from 'drizzle-orm/zod'
import { getColumns, type Table } from 'drizzle-orm'
import { useRuntimeConfig } from '#imports'

const { createInsertSchema } = createSchemaFactory()

export function resolveValidatedSchema(table: Table, intent: 'insert' | 'patch' = 'insert') {
  const columns = getColumns(table)

  const timestampOverrides = Object.fromEntries(
    Object.entries(columns)
      .filter(([_, col]) => (col as { mode?: unknown }).mode === 'timestamp')
      .map(([name]) => [
        name,
        z.union([z.date(), z.string(), z.number()]).pipe(z.coerce.date()).optional(),
      ]),
  )

  const baseSchema = createInsertSchema(table, timestampOverrides as unknown as Parameters<typeof createInsertSchema>[1])

  const { formHiddenFields } = useRuntimeConfig().public.autoCrud
  const fieldsToOmit = formHiddenFields.filter(f => f in columns)

  const sanitizedSchema = baseSchema.omit(
    Object.fromEntries(fieldsToOmit.map(f => [f, true])) as Record<string, true>,
  )

  return intent === 'patch' ? sanitizedSchema.partial() : sanitizedSchema
}
