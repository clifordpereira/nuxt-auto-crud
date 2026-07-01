/**
 * Ambient type definition for the dynamically resolved Drizzle database schema.
 * This alias maps to the configured database schema path defined in your module options.
 *
 * @defaultValue 'server/db/schema'
 */
declare module '#nac/schema' {
  /**
   * The mapped database schema containing all parsed tables and database relations.
   */
  const schema: Record<string, unknown>
  export default schema
}

declare module 'h3' {
  /**
   * Extends the global Nitro context (`event.context`) with Nuxt Auto CRUD metadata.
   */
  interface H3EventContext {
    /**
     * Interceptor configuration and contextual route state parsed by the `nac-guard` middleware.
     */
    nac?: {
      /**
       * The unique identifier of the authenticated user making the request.
       * Set to `null` if the request is unauthenticated.
       */
      userId: number | string | null
      /**
       * Flag indicating whether the current table/endpoint is accessible without authentication.
       */
      isPublic: boolean
      /**
       * Optional pre-fetched row record passed down by upstream custom middleware to eliminate duplicate database hits.
       */
      record?: Record<string, unknown>
      /**
       * Array of explicit authorization scopes or resource permissions associated with the making user.
       */
      resourcePermissions?: string[]
    }
  }
}

export {}