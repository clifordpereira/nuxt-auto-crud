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
 * Dynamically exposes RESTful CRUD APIs derived directly from your Drizzle
 * schemas. Just specify your schema, relations and app.config.ts; and your app is ready.
 * Further customisations can be done as in normal nuxt app.
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
    db: {
      dialect: 'sqlite',
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
    const { resolve } = createResolver(import.meta.url)
    const prefix = options.apiBase || options.nacEndpointPrefix || '/api/_nac'

    // ── 1. Aliases ────────────────────────────────────────────────────────
    // nac/db (which includes a drizzle db instance) is internal and not intended for consuming apps
    nuxt.options.alias['#nac/db'] = resolve('./runtime/server/utils/db')

    // Alias to consumer schema/relations with fallback to stubs for stable specifiers.
    nuxt.options.alias['#nac/schema'] = resolve(nuxt.options.rootDir, options.schemaPath!)
    nuxt.options.alias['#nac/relations'] = options.relationsPath
      ? resolve(nuxt.options.rootDir, options.relationsPath)
      : resolve('./runtime/server/stubs/empty-stub')

    // Pass optional authz relations to consumers
    nuxt.options.alias['#nac/authz-relations'] = resolve('./runtime/server/db/relations/authz')

    // Inject authz schema if the consumer opted in via `auth.useNacSchema: true`
    if (options.auth?.useNacSchema) {
      nuxt.hook('hub:db:schema:extend', ({ paths, dialect: hubDialect }) => {
        paths.push(resolve(`./runtime/server/db/schema/${hubDialect}/authz.js`))
      })
    }

    // ── 2. Runtime config ─────────────────────────────────────────────────
    const { formHiddenFields, formReadOnlyFields, nacEndpointPrefix, apiBase, ...privateOptions } = options
    nuxt.options.runtimeConfig.autoCrud = privateOptions
    nuxt.options.runtimeConfig.public.autoCrud = { formHiddenFields, formReadOnlyFields, nacEndpointPrefix, apiBase }

    // ── 3. Auto-imports ───────────────────────────────────────────────────
    addImportsDir(resolve('./runtime/composables'))
    addServerImportsDir(resolve('./runtime/server/utils'))

    // defineAuthzSeed is registered explicitly rather than via directory scan
    // to avoid accidentally exposing schema.ts or relations.ts as auto-imports
    addServerImports([{
      name: 'defineAuthzSeed',
      as: 'defineAuthzSeed',
      from: resolve('./runtime/server/db/define-authz-seed'),
    }])

    const dialect = options.db.dialect
    addServerImports([
      {
        name: 'nacGetPermissionsForUser',
        from: resolve(`./runtime/server/db/queries/${dialect}/permissions`),
      },
    ])

    // ── 4. Boot plugin ────────────────────────────────────────────────────
    // Validates and normalizes all NacFieldList configs once at server start.
    // Throws a startup error for any field name that matches no schema column,
    // so misconfiguration is caught before the first request arrives.
    addServerPlugin(resolve('./runtime/server/plugins/validate-config'))

    // ── 5. Type references ────────────────────────────────────────────────
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve('./runtime/types/index.d.ts') })
    })

    // ── 6. Middleware ─────────────────────────────────────────────────────
    // Auth Gate
    addServerHandler({
      middleware: true,
      handler: resolve('./runtime/server/middleware/nac-guard'),
    })

    // ── 7. API handlers ───────────────────────────────────────────────────
    // Dynamic CRUD endpoints are parameterised by :model (table name) and :id.
    // System endpoints expose schema introspection, UI metadata, and SSE stream.
    const apiDir = resolve('./runtime/server/api/_nac')

    const routes = [
      // Dynamic CRUD
      { path: '/:model', method: 'get', handler: '[model]/index.get' },
      { path: '/:model', method: 'post', handler: '[model]/index.post' },
      { path: '/:model/:id', method: 'get', handler: '[model]/[id].get' },
      { path: '/:model/:id', method: 'patch', handler: '[model]/[id].patch' },
      { path: '/:model/:id', method: 'delete', handler: '[model]/[id].delete' },
      // System
      { path: '/_schemas', method: 'get', handler: '_schemas/index.get' },
      { path: '/_schemas/:model', method: 'get', handler: '_schemas/[model].get' },
      { path: '/_meta', method: 'get', handler: '_meta.get' },
      { path: '/_sse', method: 'get', handler: '_sse.get' },
    ] as const

    for (const route of routes) {
      addServerHandler({
        route: `${prefix}${route.path}`,
        method: route.method,
        handler: resolve(apiDir, route.handler),
      })
    }
  },
})
