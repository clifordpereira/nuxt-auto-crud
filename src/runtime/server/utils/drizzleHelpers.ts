import type { Table } from 'drizzle-orm'
import { tableQueryConfig } from '#nac/relations'
import { useRuntimeConfig } from '#imports'
import type { ResolvedDatabaseConfig } from '@nuxthub/core'

/**
 * Get table config for dialect.
 * @returns The table config resolver.
 */
export async function nacGetTableConfigResolver() {
  const { hub } = useRuntimeConfig()
  const dbConfig = hub.db as ResolvedDatabaseConfig | false

  if (!dbConfig) {
    throw new Error('NuxtHub db is not enabled')
  }

  const isMysql = dbConfig.dialect === 'mysql'

  const { getTableConfig } = await (isMysql
    ? import('drizzle-orm/mysql-core')
    : import('drizzle-orm/sqlite-core'))

  return getTableConfig
}

/**
 * Get table name from a table.
 * @param table - The table to get the name from.
 * @returns The name of the table.
 */
export async function nacGetTableName(table: Table): Promise<string> {
  const getTableConfig = await nacGetTableConfigResolver()
  return getTableConfig(table).name
}

/**
 * Get table query config from relations.
 * @param tableName - The name of the table to get the query config for.
 * @returns The query config for the table.
 */
export function nacGetTableQueryConfig(tableName: string) {
  return tableQueryConfig[tableName] ?? {}
}
