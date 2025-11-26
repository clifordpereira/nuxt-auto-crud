import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core'

export type ModuleDatabase = BaseSQLiteDatabase<'async' | 'sync', any, Record<string, unknown>>
