/**
 * Dynamically generates a Zod validation schema from a list of field definitions.
 *
 * Example:
 *  const fields = [
 *    { name: "name", type: "string", required: true },
 *    { name: "age", type: "number" }
 *  ];
 *  const schema = useDynamicZodSchema(fields);
 */
import { z } from 'zod'

export function useDynamicZodSchema(
  fields: { name: string, type: string, required?: boolean }[],
  isEdit = false,
) {
  const validators: Record<string, z.ZodType> = {}

  fields.forEach((field) => {
    if (field.name === 'password') {
      if (isEdit) {
        // optional on edit
        validators.password = z.string().optional()
      }
      else {
        // required on create
        validators.password = z
          .string()
          .min(8, 'At least 8 characters')
          .regex(/\d/, 'At least 1 number')
          .regex(/[a-z]/, 'At least 1 lowercase letter')
          .regex(/[A-Z]/, 'At least 1 uppercase letter')
      }
      return
    }

    if (field.type === 'string') {
      validators[field.name] = field.required
        ? z.string().min(1, `${field.name} is required`)
        : z.string().optional()
    }
    else if (field.type === 'number') {
      validators[field.name] = field.required
        ? z.coerce.number()
        : z.coerce.number().optional()
    }
    else if (field.type === 'date') {
      validators[field.name] = field.required
        ? z.coerce.date()
        : z.coerce.date().optional()
    }
    else if (field.type === 'boolean') {
      validators[field.name] = z.boolean().optional()
    }
  })

  return z.object(validators)
}
