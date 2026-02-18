import { z } from 'zod'
import { createSchemaFactory } from 'drizzle-zod'
import { getColumns, type Table } from 'drizzle-orm'
import { useRuntimeConfig } from '#imports'

const { createInsertSchema } = createSchemaFactory()

export function resolveValidatedSchema(table: Table, intent: 'insert' | 'patch' = 'insert') {
  const columns = getColumns(table)

  const timestampOverrides = Object.fromEntries(
    Object.entries(columns)
      .filter(([_, col]) => (col as any).mode === 'timestamp')
      .map(([name]) => [
        name,
        // 1. Add .optional() so Zod doesn't fail when the field is missing from the request
        z.union([z.date(), z.string(), z.number()]).pipe(z.coerce.date()).optional(),
      ]),
  )

  const baseSchema = createInsertSchema(table, timestampOverrides as any)

  const { formHiddenFields } = useRuntimeConfig().public.autoCrud
  const fieldsToOmit = formHiddenFields.filter(f => Object.keys(columns).includes(f))

  // 2. Use .omit() for fields you want to strip, but ensure the base was optional for those fields
  const sanitizedSchema = baseSchema.omit(
    Object.fromEntries(fieldsToOmit.map(f => [f, true])) as any,
  )

  return intent === 'patch' ? sanitizedSchema.partial() : sanitizedSchema
}
