// src/runtime/composables/useDynamicZodSchema.ts
import { z } from 'zod'
import { ValidationRules, type Field, type FieldType } from '#nac/shared/utils/types'

export function useDynamicZodSchema(fields: Field[], isEdit = false) {
  const validators: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    const type = field.type as FieldType
    let schema: z.ZodTypeAny

    // Explicitly handle functions with arguments
    if (type === 'password') {
      schema = ValidationRules.password(isEdit)
    } else if (type === 'enum') {
      schema = ValidationRules.enum(field.selectOptions)
    } else {
      // Handle 0-argument functions safely
      const rule = (ValidationRules[type] || ValidationRules.string) as () => z.ZodTypeAny
      schema = rule()
    }

    if (!field.required || isEdit) {
      schema = schema.optional().nullable()
    }

    validators[field.name] = schema
  }

  return z.object(validators)
}