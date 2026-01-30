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
}

export interface RuntimeModuleOptions extends ModuleOptions {
}
