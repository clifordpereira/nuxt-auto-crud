import { useRuntimeConfig } from '#imports'
import type { Table, TablesRelationalConfig } from 'drizzle-orm'
import * as nacRelations from '#nac/relations'

const relations = nacRelations.relations ?? {}
const nacTableQueryConfig = nacRelations.nacTableQueryConfig ?? {}

/**
 * Represents the inferenced type of the initialized Drizzle database instance.
 * @internal
 */
type NacDb = Awaited<ReturnType<typeof initDb>>

/**
 * Internal cache for the singleton database instance.
 * @internal
 */
let _db: NacDb | null = null

/**
 * Checks whether the current database configuration targets a MySQL dialect
 * by inspecting the schema prefix of the `DATABASE_URL` environment variable.
 *
 * @returns `true` if the database string starts with a MySQL protocol; otherwise, `false`.
 * @public
 */
export function isMysql(): boolean {
  const url = process.env.DATABASE_URL
  if (!url) return false

  const lowerUrl = url.toLowerCase()
  return (
    lowerUrl.startsWith('mysql://')
    || lowerUrl.startsWith('mysql2://')
    || lowerUrl.startsWith('mysqls://')
  )
}

/**
 * Retrieves the database connection URL from the environment.
 * Throws a structured error if the configuration is missing.
 *
 * @returns The active database connection string.
 * @throws Error If `DATABASE_URL` is undefined or empty.
 * @internal
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || 'file:.data/db/sqlite.db'
  if (!url) {
    throw new Error('[nuxt-auto-crud] Missing database URL. Please set the DATABASE_URL environment variable.')
  }
  return url
}

/**
 * Verifies if relational queries are active by validating the runtime
 * configuration path and checking for defined database relation schemas.
 *
 * @returns True if the relations path is configured and at least one relation definition exists.
 */
export function hasActiveRelations(): boolean {
  const { relationsPath } = useRuntimeConfig().autoCrud
  return !!(relationsPath && relations && (Object.keys(relations).length > 0))
}

/**
 * Initializes the Drizzle ORM client instance with dynamic imports depending on
 * whether the connection string specifies a MySQL or LibSQL/SQLite backend.
 *
 * @returns The configured Drizzle database interface wrapped with system relations.
 * @internal
 */
async function initDb() {
  const url = getDatabaseUrl()

  if (isMysql()) {
    const { drizzle } = await import('drizzle-orm/mysql2')
    const mysql = await import('mysql2/promise')
    const pool = mysql.createPool({ uri: url })
    return drizzle({
      client: pool,
      relations: hasActiveRelations() ? ({ ...relations } as TablesRelationalConfig) : undefined,
    })
  }

  const { drizzle } = await import('drizzle-orm/libsql')
  const { createClient } = await import('@libsql/client')
  const client = createClient({ url })
  return drizzle({ client, relations: hasActiveRelations() ? (relations as TablesRelationalConfig) : undefined })
}

/**
 * Composable that provides the active, shared singleton instance of the
 * Nuxt Auto Crud database abstraction context.
 *
 * @returns A promise resolving to the shared Drizzle ORM database client.
 * @public
 */
export async function getNacDb(): Promise<NacDb> {
  if (!_db) _db = await initDb()
  return _db
}

/**
 * Resolves the dialect-specific `getTableConfig` utility from Drizzle Core using
 * lazy dynamic imports depending on the runtime connection.
 *
 * @returns A promise resolving to the specialized `getTableConfig` reflection handler.
 * @public
 */
export async function nacGetTableConfigResolver() {
  getDatabaseUrl()

  const { getTableConfig } = await (isMysql()
    ? import('drizzle-orm/mysql-core')
    : import('drizzle-orm/sqlite-core'))

  return getTableConfig
}

/**
 * Resolves the underlying physical table name string directly from a generic Drizzle Table instance.
 *
 * @param table - The target Drizzle configuration object representing the table.
 * @returns A promise resolving to the exact metadata string name of the table.
 * @public
 */
export async function nacGetTableName(table: Table): Promise<string> {
  const getTableConfig = await nacGetTableConfigResolver()
  return getTableConfig(table).name
}

/**
 * Extracts relation-aware schema configurations mapping to a given table query identity.
 *
 * @param tableName - The physical system identifier string of the target database table.
 * @returns The associated relational lookup configurations object, or an empty map block fallback.
 * @public
 */
export function nacGetTableQueryConfig(tableName: string): Record<string, unknown> {
  return nacTableQueryConfig[tableName] ?? {}
}
