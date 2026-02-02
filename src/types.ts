export interface ModuleOptions {
  endpointPrefix: string
  schemaPath: string
  hashedFields: string[]
  protectedFields: string[]
  hiddenFields: string[]
  systemUserFields: string[]
  auth: {
    authentication: boolean
    authorization: boolean
  }
  resources: Record<string, string[]>
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    // Internal code sees these as required because of defaults
    autoCrud: Required<Pick<ModuleOptions, 'schemaPath' | 'hashedFields' | 'auth'>>
  }
  interface PublicRuntimeConfig {
    autoCrud: Required<Omit<ModuleOptions, 'schemaPath' | 'hashedFields' | 'auth'>>
  }
}