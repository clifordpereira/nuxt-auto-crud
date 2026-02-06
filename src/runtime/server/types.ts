// src/runtime/server/types.ts
import type { BaseSQLiteDatabase, SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core'

export type ModuleDatabase = BaseSQLiteDatabase<any, any, any>

/**
 * Specifically targets tables with an 'id' column.
 * Uses SQLiteTableWithColumns to ensure property access works in handlers.
 */
export type TableWithId = SQLiteTableWithColumns<{
  name: string
  schema: undefined
  columns: {
    id: any // We use any here only because the column type varies (Integer/Text)
  }
  dialect: 'sqlite'
}>
