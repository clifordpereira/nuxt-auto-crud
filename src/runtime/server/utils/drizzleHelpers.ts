import type { Table } from 'drizzle-orm'
import { tableQueryConfig } from '#nac/relations'
import { useRuntimeConfig } from '#imports'

/**
 * Get table config for the configured database dialect.
 *
 * @returns The table config resolver.
 * @public
 */
export async function nacGetTableConfigResolver() {
  const config = useRuntimeConfig().autoCrud
  const isMysql = config.dialect === 'mysql'

  if (isMysql && !config.databaseUrl && !process.env.DATABASE_URL) {
    throw new Error('[nuxt-auto-crud] Database connection URL is not provided for MySQL dialect.')
  }

  const { getTableConfig } = await (isMysql
    ? import('drizzle-orm/mysql-core')
    : import('drizzle-orm/sqlite-core'))

  return getTableConfig
}

/**
 * Get table name from a Drizzle table instance.
 *
 * @param table - The table to get the name from.
 * @returns The name of the table.
 * @public
 */
export async function nacGetTableName(table: Table): Promise<string> {
  const getTableConfig = await nacGetTableConfigResolver()
  return getTableConfig(table).name
}

/**
 * Get table query config from database relations mapping.
 *
 * @param tableName - The name of the table to get the query config for.
 * @returns The query config for the table.
 * @public
 */
export function nacGetTableQueryConfig(tableName: string) {
  const config = (tableQueryConfig ?? {}) as Record<string, unknown>

  return config[tableName] ?? {}
}
