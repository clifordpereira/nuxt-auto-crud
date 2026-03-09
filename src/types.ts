export interface ModuleOptions {
  // Private config
  statusFiltering: boolean
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
  formReadOnlyFields: string[] /** UI: Read only fields */
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    autoCrud: Omit<ModuleOptions, 'nacEndpointPrefix' | 'formHiddenFields' | 'formReadOnlyFields'>
  }
  interface PublicRuntimeConfig {
    autoCrud: Pick<ModuleOptions, 'nacEndpointPrefix' | 'formHiddenFields' | 'formReadOnlyFields'>
  }
}
