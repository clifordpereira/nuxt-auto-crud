// server/utils/schema.ts
import { getTableColumns } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import {
  getZodSchema,
  modelTableMap,
  getTargetTableName,
  getForeignKeyPropertyName,
  getHiddenFields,
  getProtectedFields,
  getSystemUserFields,
} from "./modelMapper";

export interface Field {
  name: string;
  type: string;
  required: boolean;
  selectOptions?: string[];
  references?: string;
  isReadOnly?: boolean;
}

export function drizzleTableToFields(table: any, resourceName: string) {
  const columns = getTableColumns(table);
  const fields: Field[] = [];

  const zodSchema = getZodSchema(resourceName, "insert");

  for (const [key, col] of Object.entries(columns)) {
    if (getHiddenFields(resourceName).includes(key)) continue;

    const column = col as any;
    const zodField = (zodSchema.shape as any)[key];

    const { type, selectOptions } = mapColumnType(column, zodField);

    fields.push({
      name: key,
      type,
      required: column.notNull,
      selectOptions,
      isReadOnly: getProtectedFields().includes(key),
    });
  }

  const fieldNames = fields.map((f) => f.name);
  const labelField =
    ["name", "title", "email"].find((n) => fieldNames.includes(n)) || "id";

  try {
    const config = getTableConfig(table);
    config.foreignKeys.forEach((fk: any) => {
      const propertyName = getForeignKeyPropertyName(fk, columns);
      const field = fields.find((f) => f.name === propertyName);
      if (field) field.references = getTargetTableName(fk);
    });
  } catch {}

  return { resource: resourceName, labelField, fields };
}

function mapColumnType(
  column: any,
  zodField?: any,
): { type: string; selectOptions?: string[] } {
  // 1. Drizzle Enums
  const enumValues = column.enumValues || column.config?.enumValues;
  if (enumValues) return { type: "enum", selectOptions: enumValues };

  // 2. Zod Semantic Hints (The "Agentic" advantage)
  if (zodField?._def?.checks) {
    const checks = zodField._def.checks;
    if (checks.some((c: any) => c.kind === "email")) return { type: "email" };
    if (checks.some((c: any) => c.kind === "uuid")) return { type: "uuid" };
    if (checks.some((c: any) => c.kind === "url")) return { type: "url" };
  }

  const { dataType, columnType, name } = column;
  const isDateName =
    name.endsWith("_at") || name.endsWith("At") || name.endsWith("Login");

  if (dataType === "boolean") return { type: "boolean" };
  if (dataType === "date" || (dataType === "string" && isDateName))
    return { type: "date" };
  if (
    dataType === "number" ||
    columnType.includes("Integer") ||
    columnType.includes("Real")
  ) {
    return isDateName ? { type: "date" } : { type: "number" };
  }
  if (["content", "description", "bio", "message"].includes(name))
    return { type: "textarea" };

  return { type: "string" };
}

export async function getSchemaRelations() {
  const relations: Record<string, Record<string, string>> = {};

  for (const [tableName, table] of Object.entries(modelTableMap)) {
    try {
      const config = getTableConfig(table as any);
      const columns = getTableColumns(table as any);
      const tableRelations: Record<string, string> = {};

      for (const [key, col] of Object.entries(columns)) {
        if (getSystemUserFields().includes(key)) tableRelations[key] = "users";
      }

      config.foreignKeys.forEach((fk: any) => {
        const propName = getForeignKeyPropertyName(fk, columns);
        if (propName) tableRelations[propName] = getTargetTableName(fk);
      });

      relations[tableName] = tableRelations;
    } catch {}
  }
  return relations;
}

export async function getAllSchemas() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schemas: Record<string, any> = {};

  for (const [tableName, table] of Object.entries(modelTableMap)) {
    schemas[tableName] = drizzleTableToFields(table, tableName);
  }
  return schemas;
}

export async function getSchema(tableName: string) {
  const table = modelTableMap[tableName];
  return table ? drizzleTableToFields(table, tableName) : undefined;
}
