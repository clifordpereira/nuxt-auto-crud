export interface ModuleOptions {
  /**
   * Path to the database schema file
   * @default 'server/database/schema'
   */
  schemaPath?: string

  /**
   * Path to the drizzle instance file (must export useDrizzle)
   * @default 'server/utils/drizzle'
   */
  drizzlePath?: string

  /**
   * Authentication configuration
   */
  auth?: boolean | AuthOptions

  /**
   * Resource-specific configuration
   * Define public access and column visibility
   */
  resources?: {
    [modelName: string]: {
      /**
       * Actions allowed without authentication
       * true = all actions
       * array = specific actions ('list', 'create', 'read', 'update', 'delete')
       */
      public?: boolean | ('list' | 'create' | 'read' | 'update' | 'delete')[]
      /**
       * Columns to return for unauthenticated requests
       * If not specified, all columns (except hidden ones) are returned
       */
      publicColumns?: string[]
    }
  }
}

export interface AuthOptions {
  /**
   * Authentication type
   * @default 'session'
   */
  type?: 'session' | 'jwt'
  /**
   * JWT Secret (required if type is 'jwt')
   */
  jwtSecret?: string
  /**
   * Enable authentication checks (requires nuxt-auth-utils for session)
   * @default false
   */
  authentication: boolean
  /**
   * Enable authorization checks (requires nuxt-authorization)
   * @default false
   */
  authorization?: boolean
}

export interface RuntimeModuleOptions extends Omit<ModuleOptions, 'auth'> {
  auth: AuthOptions
}
