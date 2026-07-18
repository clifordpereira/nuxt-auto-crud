import { getColumns, type Column, Table, is, getTableName } from 'drizzle-orm'
import type { ForeignKey } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-orm/zod'
import type { z } from 'zod'

import { useRuntimeConfig } from '#imports'
import * as schema from '#nac/schema'

import type { NacField, NacSchemaDefinition, NacQueryContext } from '../../shared/utils/types'
import type { NacColumnInternal, NacZodTypeDef } from '../types'
import { NAC_SYSTEM_TABLES } from './constants'
import { NacResourceNotFoundError } from '../exceptions'

import { nacGetTableConfigResolver } from './db'

/**
 * Builds a map of all exported Drizzle tables from the schema.
 *
 * @returns A mapping of export keys to their corresponding Table instances.
 * @internal
 */
export const buildModelTableMap = (): Record<string, Table> => {
  return Object.entries(schema).reduce((acc, [key, value]) => {
    if (is(value, Table) && !NAC_SYSTEM_TABLES.includes(key)) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, Table>)
}

/**
 * Mapping of database table keys to Table instances.
 *
 * @public
 */
export const nacModelTableMap = buildModelTableMap()

/**
 * Resolves the property name for a foreign key's source column.
 *
 * @param fk - The foreign key database configuration.
 * @param columns - The schema columns mapping to search within.
 * @returns The property name or undefined if not found.
 * @internal
 */
export function getForeignKeyPropertyName(fk: ForeignKey, columns: Record<string, Column>): string | undefined {
  const targetColumnName = fk.reference().columns[0]?.name // TODO: Support composite keys if required in future
  if (!targetColumnName || !columns) return undefined

  for (const key in columns) {
    if (columns[key]?.name === targetColumnName) return key
  }
}

// helper for getSelectableFields()
function getPublicFields(resource: string) {
  const { publicResources } = useRuntimeConfig().autoCrud as {
    publicResources?: Record<string, string[]>
  }
  return publicResources?.[resource] || []
}

/**
 * Resolves the fields of a table that are allowed to be selected in queries.
 *
 * @param table - The database table instance.
 * @param context - Optional query-level client context.
 * @returns An object map of selected column instances.
 * @internal
 */
export function getSelectableFields(table: Table, context: NacQueryContext = {}): Record<string, Column> {
  const { apiHiddenFields } = useRuntimeConfig().autoCrud
  const allColumns = getColumns(table)
  const result: Record<string, Column> = {}

  const tableName = getTableName(table)
  const isPublic = context?.isPublic
  const publicFields = isPublic ? getPublicFields(tableName) : []

  const hiddenSet = new Set(apiHiddenFields)
  const publicSet = new Set(publicFields)

  for (const key in allColumns) {
    if (hiddenSet.has(key)) continue
    if (isPublic && publicSet.size > 0 && !publicSet.has(key)) continue
    const col = allColumns[key]
    if (col) result[key] = col
  }
  return result
}

/**
 * Resolves table relationships for NAC reflection.
 *
 * @param table - The table to resolve relations for.
 * @returns Map of property key to related table name.
 * @internal
 */
export async function resolveTableRelations(table: Table): Promise<Record<string, string>> {
  const getTableConfig = await nacGetTableConfigResolver()
  const config = getTableConfig(table)
  const columnsMap = getColumns(table)
  const relations: Record<string, string> = {}

  for (const fk of config.foreignKeys) {
    const targetTable = getTableConfig(fk.reference().foreignTable).name
    const propertyKey = getForeignKeyPropertyName(fk, columnsMap)
    if (propertyKey) relations[propertyKey] = targetTable
  }

  return relations
}

/**
 * Resolves the display label field name for a database model schema.
 *
 * @param columnNames - The names of all database schema columns.
 * @returns The field name representing the primary display label.
 * @internal
 */
export function getLabelField(columnNames: string[]): string {
  const candidates = ['name', 'title', 'label', 'num', 'email']
  return candidates.find(n => columnNames.includes(n)) || 'id'
}

const ZOD_TYPE_MAP: Record<string, NacField['type']> = {
  ZodDate: 'date',
  ZodNumber: 'number',
  ZodBoolean: 'boolean',
}

const SEMANTIC_CHECK_MAP: Record<string, NacField['type']> = {
  email: 'email',
  uuid: 'uuid',
  url: 'url',
}

const TEXTAREA_HINTS = ['content', 'description', 'bio', 'message']

function inferFieldType(name: string, col: Column, zodField?: z.ZodTypeAny): {
  type: NacField['type']
  selectOptions?: string[]
} {
  const zodTypeName = (zodField?._def as NacZodTypeDef | undefined)?.typeName
  let type: NacField['type'] = ZOD_TYPE_MAP[zodTypeName ?? ''] ?? 'string'

  const colInternal = col as Column & NacColumnInternal

  // DRIZZLE TYPE OVERRIDE FALLBACK
  if (
    type === 'string' && (
      colInternal.columnType === 'PgNumeric'
      || colInternal.columnType === 'MySqlNumeric'
      || colInternal.mapTo === 'number'
      || colInternal.dataType === 'number'
      || colInternal.columnType?.includes('Integer')
    )
  ) {
    type = 'number'
  }

  const enumValues = colInternal.enumValues || colInternal.config?.enumValues
  if (enumValues) return { type: 'enum', selectOptions: enumValues }

  const checks = (zodField?._def as NacZodTypeDef | undefined)?.checks ?? []
  const semanticMatch = checks.find(c => SEMANTIC_CHECK_MAP[c.kind])
  if (semanticMatch) return { type: SEMANTIC_CHECK_MAP[semanticMatch.kind]! }
  if (TEXTAREA_HINTS.includes(name)) return { type: 'textarea' }

  return { type }
}

/**
 * Generates the Auto CRUD schema reflection definition for a database table.
 *
 * @param modelName - The identifier key of the target database table.
 * @returns A promise resolving to the schema definition.
 * @example
 * ```ts
 * const schema = await nacGetSchemaDefinition('users');
 * ```
 * @public
 */
export async function nacGetSchemaDefinition(modelName: string): Promise<NacSchemaDefinition> {
  const table = nacModelTableMap[modelName]
  if (!table) throw new NacResourceNotFoundError(modelName)

  const { autoCrud, public: { autoCrud: publicAutoCrud } } = useRuntimeConfig()
  const columns = getColumns(table)
  const relations = await resolveTableRelations(table)
  const shape = createInsertSchema(table).shape

  const hiddenFields = new Set([...autoCrud.apiHiddenFields, ...publicAutoCrud.formHiddenFields])

  const fields: NacField[] = Object.entries(columns)
    .filter(([name]) => !hiddenFields.has(name))
    .map(([name, col]) => ({
      name,
      ...inferFieldType(name, col, shape[name]),
      required: (col as Column & NacColumnInternal).notNull ?? false,
      references: relations[name],
      readonly: publicAutoCrud.formReadOnlyFields.includes(name) || name === 'id',
    }))

  return {
    resource: modelName,
    labelField: getLabelField(Object.keys(columns)),
    fields,
  }
}
