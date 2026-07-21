import { defineNuxtModule, createResolver, addServerHandler, addServerImportsDir, addImportsDir, addServerPlugin } from '@nuxt/kit'
import { NAC_API_HIDDEN_FIELDS, NAC_API_WRITE_PROTECTED_FIELDS, NAC_FORM_HIDDEN_FIELDS, NAC_FORM_READ_ONLY_FIELDS } from './runtime/server/utils/constants'
import type { ModuleOptions } from './types'

export type { ModuleOptions }

/**
 * Nuxt Auto CRUD (NAC) Module
 * Generates zero-codegen dynamic RESTful CRUD APIs derived directly from your
 * Drizzle schemas. It hooks into the Nitro engine to provision endpoints
 * and maps global server utilities.
 *
 * @remarks
 * `apiHiddenFields`, `apiWriteProtectedFields`, and `formHiddenFields` all
 * accept the `NacFieldList` shape: either a flat `string[]` (applies to
 * every table), or `{ default?: string[], resources?: Record<string, string[]> }`
 * for per-table overrides. Table keys in `resources` may be the physical
 * snake_case table name or the camelCase schema export name; field names
 * may be snake_case or camelCase. `nacValidateFieldConfig()` (registered
 * below as a Nitro boot plugin, step 4) resolves and normalizes both
 * forms against the real schema once, at server start, and throws a
 * startup error for anything that matches neither. See `NacFieldList` in
 * `./types` for the full type.
 *
 * @see {@link https://github.com/clifordpereira/nuxt-auto-crud}
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-auto-crud',
    configKey: 'autoCrud',
  },

  /**
   * Default configuration options for Nuxt Auto CRUD.
   */
  defaults: {
    // Private config
    /** Automatically filter records by an `active` status column if it exists. */
    statusFiltering: false,
    /** Enable real-time CUD operation broadcasts via Server-Sent Events (SSE). */
    realtime: false,
    /** Authentication and authorization configurations. */
    auth: {
      authentication: false,
      authorization: false,
      ownerKey: 'createdBy',
    },
    /** Database tables and columns allowed to bypass authorization checks. */
    publicResources: {},
    /** Sensitive database columns to globally exclude from all API responses. NacFieldList — see module remarks. */
    apiHiddenFields: NAC_API_HIDDEN_FIELDS,
    /** Default write protected fields. NacFieldList — see module remarks. */
    apiWriteProtectedFields: NAC_API_WRITE_PROTECTED_FIELDS,
    /** Secret token required to secure and authenticate the markdown context introspector endpoint. */
    agenticToken: '',
    /** Path to your application's Drizzle schema definitions. */
    schemaPath: 'server/db/schema',

    // Public config
    /** Fields excluded from the generated UI metadata to block user input. NacFieldList — see module remarks. */
    formHiddenFields: NAC_FORM_HIDDEN_FIELDS,
    /** Fields visible in forms but locked as read-only from user modifications. */
    formReadOnlyFields: NAC_FORM_READ_ONLY_FIELDS,
    /**
     * Base path prefix where NAC endpoints are registered.
     * @deprecated Use `apiBase` instead.
     */
    nacEndpointPrefix: '/api/_nac',
    /** Base API path prefix for all auto-generated endpoints. */
    apiBase: '/api/_nac',
  },

  /**
   * Setup function executed during Nuxt initialization to configure imports,
   * path aliases, middleware, and handlers.
   * @param options - Resolved module options combining user choices and defaults.
   * @param nuxt - The current Nuxt instance.
   */
  async setup(options, nuxt) {
    const prefix = options.apiBase || options.nacEndpointPrefix || '/api/_nac'
    const resolver = createResolver(import.meta.url)

    // 1. Aliases
    nuxt.options.alias['#nac/schema'] = resolver.resolve(nuxt.options.rootDir, options.schemaPath!)
    nuxt.options.alias['#nac/db'] = resolver.resolve('./runtime/server/utils/db')

    if (options.relationsPath) {
      nuxt.options.alias['#nac/relations'] = resolver.resolve(nuxt.options.rootDir, options.relationsPath)
    }
    else {
      nuxt.options.alias['#nac/relations'] = resolver.resolve('./runtime/server/stubs/empty-stub')
    }

    // 2. Runtime Config (The Concrete State)
    // apiHiddenFields / apiWriteProtectedFields (private) and formHiddenFields
    // (public) pass through here in whatever NacFieldList shape the user
    // configured — flat array or { default, resources } — untouched. Step 4
    // normalizes casing in place, once, at boot, so nothing here or
    // downstream needs to special-case the shape.
    const { formHiddenFields, formReadOnlyFields, nacEndpointPrefix, apiBase, ...privateOptions } = options
    nuxt.options.runtimeConfig.autoCrud = privateOptions // private runtime
    nuxt.options.runtimeConfig.public.autoCrud = { formHiddenFields, formReadOnlyFields, nacEndpointPrefix, apiBase } // public runtime

    // 3. Auto-imports (The Engine)
    addImportsDir(resolver.resolve('./runtime/composables'))
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))

    // 4. Fail-Fast Guardrails: validate + normalize field-list casing once at server boot
    addServerPlugin(resolver.resolve('./runtime/server/plugins/validate-config'))

    // 5. Global Type Support (For the Playground/App)
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolver.resolve('./runtime/types/index.d.ts') })
    })

    // 6. Register the Security Guard (Interceptor)
    addServerHandler({
      middleware: true,
      handler: resolver.resolve('./runtime/server/middleware/nac-guard'),
    })

    // 7. Register Specific System Endpoints (Targets)
    const apiDir = resolver.resolve('./runtime/server/api/_nac')
    const routes = [
      // Dynamic CRUD Endpoints
      { path: '/:model', method: 'get', handler: '[model]/index.get' },
      { path: '/:model', method: 'post', handler: '[model]/index.post' },
      { path: '/:model/:id', method: 'get', handler: '[model]/[id].get' },
      { path: '/:model/:id', method: 'patch', handler: '[model]/[id].patch' },
      { path: '/:model/:id', method: 'delete', handler: '[model]/[id].delete' },
      // System Endpoints
      { path: '/_schemas', method: 'get', handler: '_schemas/index.get' },
      { path: '/_schemas/:model', method: 'get', handler: '_schemas/[model].get' },
      { path: '/_meta', method: 'get', handler: '_meta.get' },
      { path: '/_sse', method: 'get', handler: '_sse.get' },
    ] as const

    for (const route of routes) {
      addServerHandler({
        route: `${prefix}${route.path}`,
        method: route.method,
        handler: resolver.resolve(apiDir, route.handler),
      })
    }
  },
})
