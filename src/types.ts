export interface ModuleOptions {
  // Private config
  schemaPath: string
  auth: {
    authentication: boolean
    authorization: boolean
    ownerKey: string
  }
  apiHiddenFields: string[] /** Sensitive: Never leaves the server */
  agenticToken: string
  // Public config
  endpointPrefix: string
  resources: Record<string, string[]> /** Allowed fields for public apis */
  formHiddenFields: string[] /** UI: Hidden from forms */
  dataTableHiddenFields: string[] /** UI: Hidden from tables */
  realtime: boolean
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    autoCrud: Pick<ModuleOptions, 'schemaPath' | 'auth' | 'apiHiddenFields' | 'agenticToken'>
  }
  interface PublicRuntimeConfig {
    autoCrud: Omit<ModuleOptions, 'schemaPath' | 'auth' | 'apiHiddenFields' | 'agenticToken'>
  }
  interface NuxtConfig {
    autoCrud?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    autoCrud?: ModuleOptions
  }
}
