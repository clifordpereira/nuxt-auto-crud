import { getTableColumns } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import { modelTableMap } from './modelMapper'

export interface Field {
  name: string
  type: string
  required: boolean
  selectOptions?: string[]
  references?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function drizzleTableToFields(table: any, resourceName: string) {
  const columns = getTableColumns(table)
  const fields: Field[] = []

  for (const [key, col] of Object.entries(columns)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const column = col as any
    const isRequired = column.notNull

    const { type, selectOptions } = mapColumnType(column)

    fields.push({
      name: key,
      type,
      required: isRequired,
      selectOptions,
    })
  }

  // Clifland Heuristic: Auto-detect the primary label for the resource
  const fieldNames = fields.map(f => f.name)
  const labelField = fieldNames.find(n => n === 'name') 
               || fieldNames.find(n => n === 'title') 
               || fieldNames.find(n => n === 'email') 
               || 'id'

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = getTableConfig(table as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config.foreignKeys.forEach((fk: any) => {
      const sourceColumnName = fk.reference().columns[0].name

      // Find the TS property name (key) that corresponds to this SQL column name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const propertyName = Object.entries(columns).find(([_, col]: [string, any]) => col.name === sourceColumnName)?.[0]

      if (propertyName) {
        const field = fields.find(f => f.name === propertyName)
        if (field) {
          // Get target table name
          const targetTable = fk.reference().foreignTable[Symbol.for('drizzle:Name')] as string
          field.references = targetTable
        }
      }
    })
  }
  catch {
    // Ignore error if getTableConfig fails (e.g. not a Drizzle table)
  }

  return {
    resource: resourceName,
    labelField, // metadata point
    fields,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapColumnType(column: any): { type: string, selectOptions?: string[] } {
  // Check for enum values (Drizzle stores them in enumValues or config.enumValues)
  const enumValues = column.enumValues || column.config?.enumValues

  if (enumValues) {
    return { type: 'enum', selectOptions: enumValues }
  }

  if (column.dataType === 'boolean') {
    return { type: 'boolean' }
  }

  if (column.dataType === 'date' || (column.dataType === 'string' && (column.name.endsWith('_at') || column.name.endsWith('At')))) {
    return { type: 'date' }
  }

  if (column.dataType === 'number' || column.columnType === 'SQLiteInteger' || column.columnType === 'SQLiteReal') {
    // Check if it is a timestamp
    if (column.name.endsWith('_at') || column.name.endsWith('At')) {
      return { type: 'date' }
    }
    return { type: 'number' }
  }

  if (['content', 'description', 'bio', 'message'].includes(column.name)) {
    return { type: 'textarea' }
  }

  return { type: 'string' }
}

export async function getRelations() {
  const relations: Record<string, Record<string, string>> = {}

  for (const [tableName, table] of Object.entries(modelTableMap)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config = getTableConfig(table as any)
      const tableRelations: Record<string, string> = {}
      relations[tableName] = tableRelations

      // Map column names to property names
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const columns = getTableColumns(table as any)
      const columnToProperty: Record<string, string> = {}
      for (const [key, col] of Object.entries(columns)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const columnName = (col as any).name
        columnToProperty[columnName] = key

        // Auto-link createdBy/updatedBy to users table
        if (['createdBy', 'created_by', 'updatedBy', 'updated_by', 'deletedBy', 'deleted_by'].includes(key)) {
          tableRelations[key] = 'users'
        }
      }

      if (config.foreignKeys.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config.foreignKeys.forEach((fk: any) => {
          const sourceColumnName = fk.reference().columns[0].name
          const sourceProperty = columnToProperty[sourceColumnName] || sourceColumnName
          const targetTable = fk.reference().foreignTable[Symbol.for('drizzle:Name')]
          tableRelations[sourceProperty] = targetTable
        })
      }
    }
    catch {
      // Ignore tables that don't have config (e.g. not Drizzle tables)
    }
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
  if (!table) return undefined
  return drizzleTableToFields(table, tableName)
}
