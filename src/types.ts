export interface ModuleOptions {
  // Private config
  realtime: boolean
  schemaPath: string
  auth: {
    authentication: boolean
    authorization: boolean
    ownerKey: string
  }
  apiHiddenFields: string[] /** Sensitive: Never leaves the server */
  agenticToken: string
  publicResources: Record<string, string[]> /** Allowed fields for public apis */
  // Public config
  endpointPrefix: string
  formHiddenFields: string[] /** UI: Hidden from forms */
  dataTableHiddenFields: string[] /** UI: Hidden from tables */
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    autoCrud: Omit<ModuleOptions, 'endpointPrefix' | 'formHiddenFields' | 'dataTableHiddenFields'>
  }
  interface PublicRuntimeConfig {
    autoCrud: Pick<ModuleOptions, 'endpointPrefix' | 'formHiddenFields' | 'dataTableHiddenFields'>
  }
  interface NuxtConfig {
    autoCrud?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    autoCrud?: ModuleOptions
  }
}
