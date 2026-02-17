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
  nacEndpointPrefix: string
  formHiddenFields: string[] /** UI: Hidden from forms */
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    autoCrud: Omit<ModuleOptions, 'nacEndpointPrefix' | 'formHiddenFields'>
  }
  interface PublicRuntimeConfig {
    autoCrud: Pick<ModuleOptions, 'nacEndpointPrefix' | 'formHiddenFields'>
  }
  interface NuxtConfig {
    autoCrud?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    autoCrud?: ModuleOptions
  }
}
