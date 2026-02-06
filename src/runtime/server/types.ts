// src/runtime/server/types.ts
import type { BaseSQLiteDatabase, SQLiteTableWithColumns, SQLiteColumn } from 'drizzle-orm/sqlite-core'

export type ModuleDatabase = BaseSQLiteDatabase<'async', Record<string, unknown>, Record<string, unknown>>

/**
 * Specifically targets tables with an 'id' column.
 * Uses SQLiteTableWithColumns to ensure property access works in handlers.
 */
export type TableWithId = SQLiteTableWithColumns<{
  name: string
  schema: undefined
  columns: {
    id: SQLiteColumn
  }
  dialect: 'sqlite'
}>
