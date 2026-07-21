import { getColumns, type Column, Table, is, getTableName } from 'drizzle-orm'
import type { ForeignKey } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-orm/zod'
import type { z } from 'zod'

import { useRuntimeConfig } from '#imports'
import * as schema from '#nac/schema'

import type { NacField, NacSchemaDefinition, NacQueryContext } from '../../shared/utils/types'
import type { NacColumnInternal, NacZodTypeDef } from '../types'
import { NAC_API_HIDDEN_FIELDS, NAC_SYSTEM_TABLES, NAC_FORM_HIDDEN_FIELDS } from './constants'
import { resolveFieldList } from './field-resolution'
import { NacResourceNotFoundError } from '../exceptions'
import { nacGetTableConfigResolver } from './db'

/* -------------------------------------------------------------------------- */
/*                              TABLE MAP (ROOT)                              */
/* -------------------------------------------------------------------------- */

/**
 * Builds a map of all exported Drizzle tables from the schema.
 * @internal
 */
export const buildModelTableMap = (): Record<string, Table> => {
  return Object.entries(schema).reduce((acc, [, value]) => {
    if (is(value, Table)) {
      const tableName = getTableName(value)
      if (!NAC_SYSTEM_TABLES.includes(tableName)) {
        acc[tableName] = value
      }
    }
    return acc
  }, {} as Record<string, Table>)
}

/**
 * Mapping of physical (snake_case) table name → Table instance.
 * @public
 */
export const nacModelTableMap = buildModelTableMap()

/* -------------------------------------------------------------------------- */
/*                          TABLE-KEY RESOLUTION                              */
/* -------------------------------------------------------------------------- */

/**
 * Bidirectional lookup between the physical (snake_case) table name and
 * the camelCase schema export name. Built in a single pass over the
 * schema so both directions stay in sync from one source of truth.
 * @internal
 */
const nacPhysicalNameToExportKeyMap = new Map<string, string>()
const nacExportKeyToPhysicalNameMap = new Map<string, string>()

for (const [key, value] of Object.entries(schema)) {
  if (is(value, Table)) {
    const physicalName = getTableName(value)
    nacPhysicalNameToExportKeyMap.set(physicalName, key)
    nacExportKeyToPhysicalNameMap.set(key, physicalName)
  }
}

/**
 * Resolves the camelCase schema export key for a table instance, by
 * physical name. Use this (not the physical table name itself) whenever
 * looking up `db.query[...]` or `nacTableQueryConfig`.
 * @internal
 */
export function getModelExportKey(table: Table): string | undefined {
  return nacPhysicalNameToExportKeyMap.get(getTableName(table))
}

/**
 * Resolves a user-supplied resource/table key — either the physical
 * snake_case table name or the camelCase schema export name — to the
 * canonical physical name used by nacModelTableMap, routes, and
 * publicResources. A lookup against the real schema map, not a case
 * transform: an unrecognized key returns undefined.
 * @public
 */
export function nacResolveTableKey(input: string): string | undefined {
  if (input in nacModelTableMap) return input
  return nacExportKeyToPhysicalNameMap.get(input)
}

/* -------------------------------------------------------------------------- */
/*                                RELATIONS                                   */
/* -------------------------------------------------------------------------- */

/** @internal — only consumed by resolveTableRelations below */
export function getForeignKeyPropertyName(fk: ForeignKey, columns: Record<string, Column>): string | undefined {
  const targetColumnName = fk.reference().columns[0]?.name
  if (!targetColumnName || !columns) return undefined

  for (const key in columns) {
    if (columns[key]?.name === targetColumnName) return key
  }
}

/**
 * Resolves table relationships for NAC reflection.
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

/* -------------------------------------------------------------------------- */
/*                          FIELD VISIBILITY                                  */
/* -------------------------------------------------------------------------- */

function getPublicFields(resource: string) {
  const { publicResources } = useRuntimeConfig().autoCrud as {
    publicResources?: Record<string, string[]>
  }
  return publicResources?.[resource] || []
}

/**
 * Resolves the fields of a table that are allowed to be selected in queries.
 * @internal
 */
export function getSelectableFields(table: Table, context: NacQueryContext = {}): Record<string, Column> {
  const { apiHiddenFields } = useRuntimeConfig().autoCrud
  const allColumns = getColumns(table)
  const result: Record<string, Column> = {}

  const tableName = getTableName(table)
  const isPublic = context?.isPublic
  const publicFields = isPublic ? getPublicFields(tableName) : []

  const hiddenSet = resolveFieldList(apiHiddenFields, tableName, NAC_API_HIDDEN_FIELDS)
  const publicSet = new Set(publicFields)

  for (const key in allColumns) {
    if (hiddenSet.has(key)) continue
    if (isPublic && publicSet.size > 0 && !publicSet.has(key)) continue
    const col = allColumns[key]
    if (col) result[key] = col
  }
  return result
}

/* -------------------------------------------------------------------------- */
/*                          SCHEMA DEFINITION (PUBLIC API)                    */
/* -------------------------------------------------------------------------- */

export function getLabelField(columnNames: string[]): string {
  const candidates = ['name', 'title', 'label', 'num', 'email']
  return candidates.find(n => columnNames.includes(n)) || 'id'
}

const ZOD_TYPE_MAP: Record<string, NacField['type']> = {
  ZodDate: 'date', ZodNumber: 'number', ZodBoolean: 'boolean',
}
const SEMANTIC_CHECK_MAP: Record<string, NacField['type']> = {
  email: 'email', uuid: 'uuid', url: 'url',
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

  // modelName is already the physical (snake_case) resource key here
  const apiHidden = resolveFieldList(autoCrud.apiHiddenFields, modelName, NAC_API_HIDDEN_FIELDS)
  const formHidden = resolveFieldList(publicAutoCrud.formHiddenFields, modelName, NAC_FORM_HIDDEN_FIELDS)
  const hiddenFields = new Set([...apiHidden, ...formHidden])

  const fields: NacField[] = Object.entries(columns)
    .filter(([name]) => !hiddenFields.has(name))
    .map(([name, col]) => ({
      name,
      ...inferFieldType(name, col, shape[name]),
      required: (col as Column & NacColumnInternal).notNull ?? false,
      references: relations[name],
      readonly: name === 'id',
    }))

  return {
    resource: modelName,
    labelField: getLabelField(Object.keys(columns)),
    fields,
  }
}
