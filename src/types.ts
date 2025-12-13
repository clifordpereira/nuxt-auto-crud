export interface ModuleOptions {
  /**
   * Path to the database schema file
   * @default 'server/database/schema'
   */
  schemaPath?: string

  /**
   * Authentication configuration
   */
  auth?: boolean | AuthOptions

  /**
   * Resource-specific configuration
   * Define column visibility for unauthenticated users
   */
  resources?: {
    [modelName: string]: string[]
  }

  /**
   * Fields that should be automatically hashed before storage
   * @default ['password']
   */
  hashedFields?: string[]
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
