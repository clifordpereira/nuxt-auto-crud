import { getTableColumns } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import { modelTableMap } from './modelMapper'

export function drizzleTableToFields(table: any, resourceName: string) {
  const columns = getTableColumns(table)
  const fields = []

  for (const [key, col] of Object.entries(columns)) {
    const column = col as any
    const isRequired = column.notNull
    let type = 'string'
    let selectOptions: string[] | undefined = undefined

    // Map Drizzle types to frontend types
    if (column.dataType === 'number' || column.columnType === 'SQLiteInteger' || column.columnType === 'SQLiteReal') {
      type = 'number'
      // Check if it is a timestamp
      if (column.name.endsWith('_at') || column.name.endsWith('At')) {
         type = 'date'
      }
    } else if (column.dataType === 'boolean') {
      type = 'boolean'
    } else if (column.dataType === 'date' || column.dataType === 'string' && (column.name.endsWith('_at') || column.name.endsWith('At'))) {
      type = 'date'
    }

    fields.push({
      name: column.name,
      type,
      required: isRequired,
      selectOptions
    })
  }

  return {
    resource: resourceName,
    fields
  }
}

export async function getRelations() {
  const relations: Record<string, Record<string, string>> = {}

  for (const [tableName, table] of Object.entries(modelTableMap)) {
    try {
      const config = getTableConfig(table as any)
      if (config.foreignKeys.length > 0) {
        const tableRelations: Record<string, string> = {}
        relations[tableName] = tableRelations
        config.foreignKeys.forEach((fk: any) => {
           const sourceColumn = fk.reference().columns[0].name
           const targetTable = fk.reference().foreignTable[Symbol.for('drizzle:Name')]
           tableRelations[sourceColumn] = targetTable
        })
      }
    } catch (e) {
      // Ignore tables that don't have config (e.g. not Drizzle tables)
    }
  }
  return relations
}

export async function getAllSchemas() {
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
