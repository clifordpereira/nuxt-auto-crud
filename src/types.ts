export interface ModuleOptions {
  endpointPrefix: string
  schemaPath: string
  protectedFields: string[]
  hiddenFields: string[]
  systemUserFields: string[]
  auth: {
    authentication: boolean
    authorization: boolean
    ownerKey: string
  }
  resources: Record<string, string[]>
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    // Internal code sees these as required because of defaults
    autoCrud: Required<Pick<ModuleOptions, 'schemaPath' | 'auth'>>
  }
  interface PublicRuntimeConfig {
    autoCrud: Required<Omit<ModuleOptions, 'schemaPath' | 'auth'>>
  }
}
