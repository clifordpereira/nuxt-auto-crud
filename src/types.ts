/**
 * Configuration options for the NacAutoCrud module.
 *
 * @public
 */
export interface ModuleOptions {
  /**
   * Enable or disable status-based filtering of query results.
   */
  statusFiltering: boolean

  /**
   * Enable or disable real-time Server-Sent Events (SSE) broadcasting.
   */
  realtime: boolean

  /**
   * The absolute or relative file path to the Drizzle schema files.
   */
  schemaPath: string

  /**
   * The file path to the Drizzle database relations mapping files.
   */
  relationsPath?: string

  /**
   * Authentication and authorization parameters.
   */
  auth: {
    authentication: boolean
    authorization: boolean
    ownerKey: string
  }

  /**
   * Highly sensitive database columns that should never be exposed in API responses.
   */
  apiHiddenFields: string[]

  /**
   * The token utilized to validate secure external API connections.
   */
  agenticToken: string

  /**
   * Map of public database tables and their allowed fields for unauthenticated access.
   */
  publicResources: Record<string, string[]>

  /**
   * Endpoint routing prefix for Auto CRUD REST APIs.
   *
   * @deprecated Use `apiBase` instead.
   */
  nacEndpointPrefix: string

  /**
   * The endpoint routing base path for all Auto CRUD REST APIs.
   */
  apiBase: string

  /**
   * Database columns that will be hidden in form views within UI components.
   */
  formHiddenFields: string[]

  /**
   * Database columns that are read-only in form views within UI components.
   */
  formReadOnlyFields: string[]
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    autoCrud: Omit<ModuleOptions, 'formHiddenFields' | 'formReadOnlyFields' | 'nacEndpointPrefix' | 'apiBase'>
  }
  interface PublicRuntimeConfig {
    autoCrud: Pick<ModuleOptions, 'formHiddenFields' | 'formReadOnlyFields' | 'nacEndpointPrefix' | 'apiBase'>
  }
}
