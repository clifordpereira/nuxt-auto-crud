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

/**
 * A field-name list, either as a flat global list, or scoped per-resource.
 *
 * - `string[]` — flat list, applies identically to every resource (current behavior).
 * - `{ default, resources }` — `default` replaces the module's built-in list if provided
 *   (omit to keep the built-in); `resources[key]` fields are *appended* on top of
 *   whichever default list applies, for that resource only.
 *
 * Resource keys match the physical (snake_case) table name — the same key used
 * in routes and `nacModelTableMap`, not the camelCase schema export name.
 */
export type NacFieldList = string[] | {
  default?: string[]
  resources?: Record<string, string[]>
}
