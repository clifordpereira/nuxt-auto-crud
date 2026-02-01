// src/types.ts
export interface ModuleOptions {
  /**
   * Path to the database schema file
   * @default 'server/database/schema'
   */
  schemaPath?: string

  /**
   * Fields that should be automatically hashed before storage
   * @default ['password']
   */
  hashedFields?: string[]

  /**
   * Authentication and Authorization settings
   */
  auth?: {
    authentication?: boolean
    authorization?: boolean
    /** Path to the ability definition file */
    abilityPath?: string
  }
}

export interface RuntimeModuleOptions extends ModuleOptions {}
