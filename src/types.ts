/**
 * Represents a field-name list, either as a flat global list, or scoped per-resource.
 *
 * - `string[]` — flat list, applies identically to every resource (current behavior).
 * - `{ default, resources }` — `default` replaces the module's built-in list if provided
 *   (omit to keep the built-in); `resources[key]` fields are *appended* on top of
 *   whichever default list applies, for that resource only.
 *
 * Resource keys match the physical (snake_case) table name — the same key used
 * in routes and `nacModelTableMap`, not the camelCase schema export name.
 */
export type NacFieldList = string[] | {
  default?: string[]
  resources?: Record<string, string[]>
}

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
    authorization?: boolean
    ownerKey?: string
    useNacSchema?: boolean
  }

  db: {
    dialect: 'sqlite' | 'postgresql' | 'mysql'
  }

  /**
   * Highly sensitive database columns that should never be exposed in API responses.
   */
  apiHiddenFields: string[]

  /**
   * Server-enforced: fields a client can never set via POST/PATCH body,
   * regardless of what the UI does. Protects against mass-assignment
   * (e.g. a client setting `createdBy`, `id`, `deletedAt` directly).
   */
  apiWriteProtectedFields: string[]

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
   * UI-facing hint: fields to exclude from generated form metadata (_schemas).
   * Purely cosmetic — has no effect on what the server accepts.
   *
   * @deprecated configure at client side instead
   */
  formHiddenFields: string[]

  /**
   * Database columns that are read-only in form views within UI components.
   *
   * @deprecated configure at client side instead
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
  interface NuxtHooks {
    'hub:db:schema:extend': (ctx: {
      dialect: string
      paths: string[]
    }) => void | Promise<void>
  }
}
