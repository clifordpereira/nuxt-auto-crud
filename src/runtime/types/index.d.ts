/**
 * The schema path to make this import dynamic
 * @default 'server/db/schema'
 */
declare module '#nac/schema' {
  const schema: Record<string, unknown>
  export default schema
}

/**
 * Interface for injecting application-level context into the NAC core.
 * Facilitates the transfer of actor metadata, permissions and record fetched,
 * from the application to the nuxt-auto-crud engine.
 */
export interface QueryContext {
  userId?: number | string | null
  permissions?: string[] | null
  record?: Record<string, unknown> | null
  isPublic?: boolean
}

export {}