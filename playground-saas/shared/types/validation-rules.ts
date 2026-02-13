import { z } from 'zod'

/**
 * Validation Factory
 * Ensures backend and frontend never drift.
 */
export const ValidationRules = {
  email: () => z.email(),
  number: () => z.number(),
  date: () => z.date(),
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
