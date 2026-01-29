// server/utils/schema.ts
import { getTableColumns } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import { modelTableMap } from './modelMapper'
import { HIDDEN_FIELDS, SYSTEM_USER_FIELDS } from './constants'

export interface Field {
  name: string
  type: string
  required: boolean
  selectOptions?: string[]
  references?: string
}

/**
 * Extracts the target table name from a Drizzle foreign key
 */
function getTargetTableName(fk: any): string {
  return fk.reference().foreignTable[Symbol.for('drizzle:Name')]
}

export function drizzleTableToFields(table: any, resourceName: string) {
  const columns = getTableColumns(table)
  const fields: Field[] = []

  for (const [key, col] of Object.entries(columns)) {
    if (HIDDEN_FIELDS.includes(key)) continue

    const column = col as any
    const { type, selectOptions } = mapColumnType(column)

    fields.push({
      name: key,
      type,
      required: column.notNull,
      selectOptions,
    })
  }

  const fieldNames = fields.map(f => f.name)
  const labelField = ['name', 'title', 'email'].find(n => fieldNames.includes(n)) || 'id'

  try {
    const config = getTableConfig(table)
    config.foreignKeys.forEach((fk: any) => {
      const sourceCol = fk.reference().columns[0].name
      const propertyName = Object.entries(columns).find(([_, c]: [string, any]) => c.name === sourceCol)?.[0]
      const field = fields.find(f => f.name === propertyName)
      if (field) field.references = getTargetTableName(fk)
    })
  } catch {}

  return { resource: resourceName, labelField, fields }
}

function mapColumnType(column: any): { type: string, selectOptions?: string[] } {
  const enumValues = column.enumValues || column.config?.enumValues
  if (enumValues) return { type: 'enum', selectOptions: enumValues }

  const { dataType, columnType, name } = column
  const isDateName = name.endsWith('_at') || name.endsWith('At') || name.endsWith('Login')

  if (dataType === 'boolean') return { type: 'boolean' }
  if (dataType === 'date' || (dataType === 'string' && isDateName)) return { type: 'date' }
  if (dataType === 'number' || columnType.includes('Integer') || columnType.includes('Real')) {
    return isDateName ? { type: 'date' } : { type: 'number' }
  }
  if (['content', 'description', 'bio', 'message'].includes(name)) return { type: 'textarea' }

  return { type: 'string' }
}

export async function getRelations() {
  const relations: Record<string, Record<string, string>> = {}

  for (const [tableName, table] of Object.entries(modelTableMap)) {
    try {
      const config = getTableConfig(table as any)
      const columns = getTableColumns(table as any)
      const tableRelations: Record<string, string> = {}

      for (const [key, col] of Object.entries(columns)) {
        if (SYSTEM_USER_FIELDS.includes(key)) tableRelations[key] = 'users'
      }

      config.foreignKeys.forEach((fk: any) => {
        const sourceColName = fk.reference().columns[0].name
        const propName = Object.entries(columns).find(([_, c]: [string, any]) => (c as any).name === sourceColName)?.[0]
        if (propName) tableRelations[propName] = getTargetTableName(fk)
      })

      relations[tableName] = tableRelations
    } catch {}
  }
  return relations
}

export async function getAllSchemas() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schemas: Record<string, any> = {}

  for (const [tableName, table] of Object.entries(modelTableMap)) {
    schemas[tableName] = drizzleTableToFields(table, tableName)
  }
  return schemas
}

export async function getSchema(tableName: string) {
  const table = modelTableMap[tableName]
  return table ? drizzleTableToFields(table, tableName) : undefined
}