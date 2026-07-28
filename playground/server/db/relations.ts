import { defineRelations } from 'drizzle-orm'
import { nacAuthzRelationsConfig, nacAuthzTableQueryConfig } from '#nac/authz-relations'

export const relations = defineRelations(schema, r => ({
  ...nacAuthzRelationsConfig(r),
  // app's own tables, added alongside
}))

export const nacTableQueryConfig = {
  ...nacAuthzTableQueryConfig,
  // app's own tableQueryConfig, added alongside
}
