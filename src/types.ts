// src/types.ts

export interface ModuleOptions {
  // Private config
  schemaPath: string
  auth: {
    authentication: boolean
    authorization: boolean
    ownerKey: string
  }
  apiHiddenFields: string[] /** Sensitive: Never leaves the server */
  // Public config
  endpointPrefix: string
  resources: Record<string, string[]> /** Allowed fields for public apis */
  formHiddenFields: string[] /** UI: Hidden from forms */
  dataTableHiddenFields: string[] /** UI: Hidden from tables */
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    autoCrud: Pick<ModuleOptions, 'schemaPath' | 'auth' | 'apiHiddenFields'>
  }
  interface PublicRuntimeConfig {
    autoCrud: Omit<ModuleOptions, 'schemaPath' | 'auth' | 'apiHiddenFields'>
  }
}
