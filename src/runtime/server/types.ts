import type { Table, AnyColumn } from 'drizzle-orm'

export type TableWithId = Table & {
  id: AnyColumn
  [key: string]: AnyColumn
}

// Internal Drizzle column shape not exposed in public types
export interface ColumnInternal {
  enumValues?: string[]
  notNull?: boolean
  config?: {
    enumValues?: string[]
  }
}

// Zod internal def shape used for type inference
export interface ZodTypeDef {
  typeName: string
  checks?: ZodCheck[]
}

export interface ZodCheck {
  kind: string
}
