import type { Table } from "drizzle-orm";
import { tableQueryConfig } from "#nac/relations";
import { useRuntimeConfig } from '#imports'

/**
 * Get table config for dialect.
 * @returns 
 */
export async function nacGetTableConfigForDialect() {
  const { hub } = useRuntimeConfig() as unknown as {
    hub: { db: { dialect?: string } | string };
  };
  const dbConfig = hub.db;
  const isMysql =
    dbConfig === "mysql" ||
    (typeof dbConfig === "object" && dbConfig?.dialect === "mysql");

  const { getTableConfig } = await (isMysql
    ? import("drizzle-orm/mysql-core")
    : import("drizzle-orm/sqlite-core"));

  return getTableConfig;
}

/**
 * Get table query config from relations.
 * @param table 
 * @returns 
 */
export async function nacGetTableQueryConfig(table: Table) {
  const getTableConfig = await nacGetTableConfigForDialect();
  const tableName = getTableConfig(table).name;
  return tableQueryConfig[tableName] ?? {};
}
