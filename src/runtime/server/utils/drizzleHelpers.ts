import type { Table } from "drizzle-orm";
import { tableRelations } from "#nac/relations";
import { useRuntimeConfig } from '#imports'

export async function getTableConfigForDialect() {
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

export async function getQueryOptionsFromSchema(table: Table) {
  const getTableConfig = await getTableConfigForDialect();
  const tableName = getTableConfig(table).name;
  return tableRelations[tableName] ?? {};
}