import type { Table, AnyColumn } from 'drizzle-orm'

/**
 * Represents a Drizzle database table that is guaranteed to contain a primary `id` column.
 *
 * @public
 */
export type NacTableWithId = Table & {
  id: AnyColumn
  [key: string]: AnyColumn
}

/**
 * Describes Drizzle's internal column metadata configuration.
 *
 * @public
 */
export interface NacColumnInternal {
  enumValues?: string[]
  notNull?: boolean
  columnType?: string
  mapTo?: string
  dataType?: string
  config?: {
    enumValues?: string[]
  }
}

/**
 * Describes the internal definition layout of a Zod schema type, used for runtime inspection.
 *
 * @public
 */
export interface NacZodTypeDef {
  typeName: string
  checks?: NacZodCheck[]
}

/**
 * Describes a validation check rule applied to a Zod field.
 *
 * @public
 */
export interface NacZodCheck {
  kind: string
}

