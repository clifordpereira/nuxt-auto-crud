export interface Field {
  name: string
  type: string
  required?: boolean
  selectOptions?: string[]
  references?: string
  readonly?: boolean
}

export interface SchemaDefinition {
  resource: string
  labelField: string
  fields: Field[]
}

/**
 * Interface for injecting application-level context into the NAC core.
 * Facilitates the transfer of actor metadata, resourcePermissions and record fetched,
 * from the application to the nuxt-auto-crud engine.
 */
export interface QueryContext {
  userId?: number | string | null
  resourcePermissions?: string[] | null
  record?: Record<string, unknown> | null
  isPublic?: boolean
}
