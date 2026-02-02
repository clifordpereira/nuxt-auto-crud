// runtime/server/utils/modelMapper.ts
// @ts-expect-error - #site/schema is an alias defined by the module
import * as schema from "#site/schema";
import pluralize from "pluralize";
import { pascalCase } from "scule";
import {
  getTableColumns as getDrizzleTableColumns,
  getTableName,
} from "drizzle-orm";
import { getTableConfig, type SQLiteTable } from "drizzle-orm/sqlite-core";
import { createError } from "h3";
import { useRuntimeConfig } from "#imports";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

export const customUpdatableFields: Record<string, string[]> = {};
export const customHiddenFields: Record<string, string[]> = {};

/**
 * Builds a map of all exported Drizzle tables from the schema.
 */
function buildModelTableMap(): Record<string, unknown> {
  const tableMap: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(schema)) {
    if (value && typeof value === "object") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tableName = getTableName(value as any);
        if (tableName) {
          tableMap[key] = value;
        }
      } catch {
        // Not a table
      }
    }
  }

  return tableMap;
}

export const modelTableMap = buildModelTableMap();

/**
 * @throws 404 if modelName is not found in tableMap.
 */
export function getTableForModel(modelName: string): SQLiteTable {
  const table = modelTableMap[modelName];

  if (!table) {
    const availableModels = Object.keys(modelTableMap).join(", ");
    throw createError({
      statusCode: 404,
      message: `Model '${modelName}' not found. Available models: ${availableModels}`,
    });
  }

  return table as SQLiteTable;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTableColumns(table: any): string[] {
  try {
    const columns = getDrizzleTableColumns(table);
    return Object.keys(columns);
  } catch (e) {
    console.error("[getTableColumns] Error getting columns:", e);
    return [];
  }
}

/**
 * Extracts the target table name from a Drizzle foreign key.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTargetTableName(fk: any): string {
  return fk.reference().foreignTable[Symbol.for("drizzle:Name")];
}

/**
 * Resolves the property name for a foreign key's source column.
 * @returns The property name or undefined if not found
 */

export function getForeignKeyPropertyName(
  fk: any,
  columns: Record<string, any>,
): string | undefined {
  const sourceColName = fk.reference().columns[0].name;
  return Object.entries(columns).find(
    ([_, c]: [string, any]) => c.name === sourceColName,
  )?.[0];
}

export function getUpdatableFields(modelName: string): string[] {
  if (customUpdatableFields[modelName]) {
    return customUpdatableFields[modelName];
  }

  const table = modelTableMap[modelName];
  if (!table) return [];

  const allColumns = getTableColumns(table);
  return allColumns.filter(
    (col) => !getProtectedFields().includes(col) && !getHiddenFields(modelName).includes(col),
  );
}

/**
 * Filters and coerces data for updates, handling timestamp conversion.
 */
export function filterUpdatableFields(
  modelName: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const allowedFields = getUpdatableFields(modelName);
  const filtered: Record<string, unknown> = {};
  const table = modelTableMap[modelName];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = table ? getDrizzleTableColumns(table as any) : {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      let value = data[field];
      const column = columns[field];

      if (column && column.mode === "timestamp" && typeof value === "string") {
        value = new Date(value);
      }

      filtered[field] = value;
    }
  }

  return filtered;
}

export function getModelSingularName(modelName: string): string {
  const singular = pluralize.singular(modelName);
  return pascalCase(singular);
}

export function getModelPluralName(modelName: string): string {
  return pluralize.plural(modelName).toLowerCase();
}

export function getAvailableModels(): string[] {
  return Object.keys(modelTableMap);
}

export function getHiddenFields(modelName: string): string[] {
  const { autoCrud } = useRuntimeConfig().public;
  const globalHidden = autoCrud.hiddenFields || [];
  const custom = customHiddenFields[modelName] || [];
  
  return [...globalHidden, ...custom];
}

export function getProtectedFields(): string[] {
  const { autoCrud } = useRuntimeConfig().public;
  return autoCrud.protectedFields || [];
}

export function getSystemUserFields(): string[] {
  const { autoCrud } = useRuntimeConfig().public;
  return autoCrud.systemUserFields || [];
}

export function getPublicColumns(modelName: string): string[] | undefined {
  const { resources } = useRuntimeConfig().public.autoCrud;
  return resources?.[modelName];
}

/**
 * Sanitizes resource data based on guest mode and configuration.
 * - Always filters globally excluded HIDDEN_FIELDS.
 * - If isGuest=true AND resource has explicit public fields configured, filters to Allowlist.
 */
export function sanitizeResource(
  modelName: string,
  data: Record<string, unknown>
): Record<string, unknown> {
  const hidden = getHiddenFields(modelName);
  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Drop fields in global HIDDEN_FIELDS or system-level exclusions
    if (hidden.includes(key) || key === 'deletedAt') {
      continue;
    }
    filtered[key] = value;
  }

  return filtered;
}

/**
 * Derives Zod schema via drizzle-zod, omitting server-managed and protected fields.
 */

export function getZodSchema(
  modelName: string,
  type: "insert" | "patch" = "insert",
): z.ZodObject<any, any> {
  const table = getTableForModel(modelName);
  const schema = createInsertSchema(table);

  if (type === "patch") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return schema.partial() as z.ZodObject<any, any>;
  }

  const OMIT_ON_CREATE = [...getProtectedFields(), ...getHiddenFields(modelName)];

  const columns = getDrizzleTableColumns(table);
  const fieldsToOmit: Record<string, true> = {};

  OMIT_ON_CREATE.forEach((field) => {
    if (columns[field]) {
      fieldsToOmit[field] = true;
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (schema as any).omit(fieldsToOmit);
}

export function formatResourceResult(
  model: string,
  data: Record<string, unknown> | Record<string, unknown>[] | null | undefined
): Record<string, unknown> | Record<string, unknown>[] | null | undefined {
  if (!data) return data;

  const sanitize = (item: Record<string, unknown>) => sanitizeResource(model, item);

  return Array.isArray(data) ? data.map(sanitize) : sanitize(data);
}

export function getRelations(): Record<string, Record<string, unknown>[]> {
  const relations: Record<string, Record<string, unknown>[]> = {};
  const models = getAvailableModels();

  for (const model of models) {
    const table = getTableForModel(model);
    const config = getTableConfig(table);
    const modelRelations: Record<string, unknown>[] = [];

    // @ts-expect-error - Drizzle internals
    const foreignKeys = config.foreignKeys || [];

    // @ts-expect-error - Drizzle internals
    for (const fk of foreignKeys) {
      const targetTable = fk.reference().foreignTable;
      const targetTableName = getTableName(targetTable);

      modelRelations.push({
        name: targetTableName,
        type: "one",
        target: targetTableName,
      });
    }

    relations[model] = modelRelations;
  }

  return relations;
}
