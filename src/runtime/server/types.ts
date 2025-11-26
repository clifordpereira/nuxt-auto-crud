import type { BaseSQLiteDatabase, SQLiteTable, SQLiteColumn } from 'drizzle-orm/sqlite-core'

export type ModuleDatabase = BaseSQLiteDatabase<'async' | 'sync', unknown, Record<string, unknown>>

export type TableWithId = SQLiteTable & { id: SQLiteColumn }
