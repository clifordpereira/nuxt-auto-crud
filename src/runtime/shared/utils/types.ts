import { z } from 'zod'

export interface Field {
  name: string
  type: string
  required?: boolean
  selectOptions?: string[]
  references?: string
  isReadOnly?: boolean
}

export interface SchemaDefinition {
  resource: string
  labelField: string
  fields: Field[]
}

/**
 * Validation Factory
 * Ensures backend and frontend never drift.
 */
export const ValidationRules = {
  email: () => z.string().email(),
  number: () => z.coerce.number(),
  date: () => z.coerce.date(),
  boolean: () => z.boolean(),
  password: (isEdit?: boolean) => isEdit
    ? z.string().optional()
    : z.string().min(8).regex(/\d/).regex(/[a-z]/).regex(/[A-Z]/),
  string: () => z.string(),
  textarea: () => z.string(),
  enum: (options?: string[]) => options?.length
    ? z.enum(options as [string, ...string[]])
    : z.string(),
} as const

export type FieldType = keyof typeof ValidationRules
