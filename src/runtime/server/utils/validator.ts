import { z } from 'zod'
import { createSchemaFactory } from 'drizzle-zod'
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
        // 1. Add .optional() so Zod doesn't fail when the field is missing from the request
        z.union([z.date(), z.string(), z.number()]).pipe(z.coerce.date()).optional(),
      ]),
  )

  /*
    timestampOverrides is constructed from the table columns at runtime.
    We cast to unknown first because Record<string, ...> is too broad for drizzle-zod's strict checks,
    but we know the keys are valid column names derived from the table itself.
  */
  const baseSchema = createInsertSchema(table, timestampOverrides as unknown as Parameters<typeof createInsertSchema>[1])

  const { formHiddenFields } = useRuntimeConfig().public.autoCrud
  const fieldsToOmit = formHiddenFields.filter(f => Object.keys(columns).includes(f))

  // 2. Use .omit() for fields you want to strip.
  // We cast to Record<string, true | undefined> which satisfies the Mask type for ZodObject.omit
  const sanitizedSchema = baseSchema.omit(
    Object.fromEntries(fieldsToOmit.map(f => [f, true])) as Record<string, true | undefined>,
  )

  return intent === 'patch' ? sanitizedSchema.partial() : sanitizedSchema
}
