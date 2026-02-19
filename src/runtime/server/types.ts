import type { Table, AnyColumn } from 'drizzle-orm'

export type TableWithId = Table & {
  id: AnyColumn
  [key: string]: AnyColumn
}
