import { defineRelations, type DBQueryConfig } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, _ => ({}))

export const tableQueryConfig: Record<string, DBQueryConfig> = {}
