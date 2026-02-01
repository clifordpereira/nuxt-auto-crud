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
  }
}

export interface RuntimeModuleOptions extends ModuleOptions {}
