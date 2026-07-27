import {
  defineNuxtModule,
  createResolver,
  addServerHandler,
  addServerImportsDir,
  addImportsDir,
  addServerPlugin,
  addServerImports,
} from '@nuxt/kit'
import {
  NAC_API_HIDDEN_FIELDS,
  NAC_API_WRITE_PROTECTED_FIELDS,
  NAC_FORM_HIDDEN_FIELDS,
  NAC_FORM_READ_ONLY_FIELDS,
} from './runtime/server/utils/constants'
import type { ModuleOptions } from './types'

export type { ModuleOptions }

/**
 * Nuxt Auto CRUD (NAC) Module
 *
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
    // ── Private config ────────────────────────────────────────────────────
    /** Automatically filter records by an `active` status column if it exists. */
    statusFiltering: false,
    /** Enable real-time CUD operation broadcasts via Server-Sent Events (SSE). */
    realtime: false,
    /** Authentication and authorization configurations. */
    auth: {
      authentication: false,
      authorization: false,
      ownerKey: 'createdBy',
      useNacSchema: false,
    },
    /** Database tables and columns allowed to bypass authorization checks. */
    publicResources: {},
    /** Sensitive database columns to globally exclude from all API responses. NacFieldList — see module remarks. */
    apiHiddenFields: NAC_API_HIDDEN_FIELDS,
    /** Columns that cannot be written via the API. NacFieldList — see module remarks. */
    apiWriteProtectedFields: NAC_API_WRITE_PROTECTED_FIELDS,
    /** Secret token required to secure and authenticate the markdown context introspector endpoint. */
    agenticToken: '',
    /** Path to your application's Drizzle schema definitions. */
    schemaPath: 'server/db/schema',

    // ── Public config ─────────────────────────────────────────────────────
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
   *
   * Execution order:
   *  1. Aliases          — path resolution for schema, relations, db
   *  2. Runtime config   — split private/public options into runtimeConfig
   *  3. Auto-imports     — server utils, composables, seed helper
   *  4. Boot plugin      — fail-fast field-list validation at server start
   *  5. Type references  — expose module types to the consuming app
   *  6. Middleware       — NAC security guard (runs on every request)
   *  7. API handlers     — dynamic CRUD + system endpoints
   *
   * @param options - Resolved module options combining user choices and defaults.
   * @param nuxt    - The current Nuxt instance.
   */
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const prefix = options.apiBase || options.nacEndpointPrefix || '/api/_nac'

    // ── 1. Aliases ────────────────────────────────────────────────────────
    // Point #nac/* at the consuming app's own files (schema, relations) or at
    // module-internal stubs so every import site uses a stable specifier.
    nuxt.options.alias['#nac/db'] = resolver.resolve('./runtime/server/utils/db')
    nuxt.options.alias['#nac/schema'] = resolver.resolve(nuxt.options.rootDir, options.schemaPath!)
    nuxt.options.alias['#nac/relations'] = options.relationsPath
      ? resolver.resolve(nuxt.options.rootDir, options.relationsPath)
      : resolver.resolve('./runtime/server/stubs/empty-stub')

    // #authz/* → resolves INTO the module's OWN files, for the consuming
    // app to import FROM (nacDefineAuthzTables, nacAuthzRelationsConfig, etc.)
    nuxt.options.alias['#nac/authz-relations'] = resolver.resolve('./runtime/server/db/relations')

    if (options.auth?.useNacSchema) {
      nuxt.hook('hub:db:schema:extend', async ({ dialect, paths }) => {
        paths.push(resolver.resolve(`./runtime/server/db/schema.${dialect}.js`))
      })
    }

    // ── 2. Runtime config ─────────────────────────────────────────────────
    // Private options stay server-side; public options are exposed to the client.
    // NacFieldList shapes are passed through untouched — the boot plugin (step 4)
    // normalizes casing once at server start so nothing downstream needs to
    // special-case the shape.
    const { formHiddenFields, formReadOnlyFields, nacEndpointPrefix, apiBase, ...privateOptions } = options
    nuxt.options.runtimeConfig.autoCrud = privateOptions
    nuxt.options.runtimeConfig.public.autoCrud = { formHiddenFields, formReadOnlyFields, nacEndpointPrefix, apiBase }

    // ── 3. Auto-imports ───────────────────────────────────────────────────
    // Composables are universal (client + server).
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Server utils are scanned as a directory — every export in
    // runtime/server/utils/ becomes an implicit server-side auto-import,
    // mirroring how a consuming app's own server/utils/ folder works.
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))

    // defineAuthzSeed is registered explicitly rather than via directory scan
    // to avoid accidentally exposing schema.ts or relations.ts as auto-imports.
    addServerImports([{
      name: 'defineAuthzSeed',
      as: 'defineAuthzSeed',
      from: resolver.resolve('./runtime/server/db/define-authz-seed'),
    }])

    // ── 4. Boot plugin ────────────────────────────────────────────────────
    // Validates and normalizes all NacFieldList configs once at server start.
    // Throws a startup error for any field name that matches no schema column,
    // so misconfiguration is caught before the first request arrives.
    addServerPlugin(resolver.resolve('./runtime/server/plugins/validate-config'))

    // ── 5. Type references ────────────────────────────────────────────────
    // Adds the module's type declarations to the consuming app's TypeScript
    // context so ModuleOptions, NacFieldList, etc. are available without
    // an explicit import.
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolver.resolve('./runtime/types/index.d.ts') })
    })

    // ── 6. Middleware ─────────────────────────────────────────────────────
    // NAC guard runs on every incoming request before any route handler.
    // Registered before route handlers (step 7) so execution order is guaranteed.
    addServerHandler({
      middleware: true,
      handler: resolver.resolve('./runtime/server/middleware/nac-guard'),
    })

    // ── 7. API handlers ───────────────────────────────────────────────────
    // Dynamic CRUD endpoints are parameterised by :model (table name) and :id.
    // System endpoints expose schema introspection, UI metadata, and SSE stream.
    const apiDir = resolver.resolve('./runtime/server/api/_nac')

    const routes = [
      // Dynamic CRUD
      { path: '/:model',     method: 'get',    handler: '[model]/index.get' },
      { path: '/:model',     method: 'post',   handler: '[model]/index.post' },
      { path: '/:model/:id', method: 'get',    handler: '[model]/[id].get' },
      { path: '/:model/:id', method: 'patch',  handler: '[model]/[id].patch' },
      { path: '/:model/:id', method: 'delete', handler: '[model]/[id].delete' },
      // System
      { path: '/_schemas',        method: 'get', handler: '_schemas/index.get' },
      { path: '/_schemas/:model', method: 'get', handler: '_schemas/[model].get' },
      { path: '/_meta',           method: 'get', handler: '_meta.get' },
      { path: '/_sse',            method: 'get', handler: '_sse.get' },
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
