import {
  defineNuxtModule,
  createResolver,
  addServerHandler,
  addServerImportsDir,
  addImportsDir,
} from '@nuxt/kit'

import { NAC_API_HIDDEN_FIELDS, NAC_FORM_HIDDEN_FIELDS, NAC_DATA_TABLE_HIDDEN_FIELDS } from './runtime/server/utils/constants'
import type { ModuleOptions } from './types'

export type { ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-auto-crud',
    configKey: 'autoCrud',
  },
  defaults: {
    // Private config
    schemaPath: 'server/db/schema',
    auth: {
      authentication: false,
      authorization: false,
      ownerKey: 'createdBy',
    },
    apiHiddenFields: NAC_API_HIDDEN_FIELDS,
    // Public config
    endpointPrefix: '/api/_nac',
    resources: {},
    formHiddenFields: NAC_FORM_HIDDEN_FIELDS,
    dataTableHiddenFields: NAC_DATA_TABLE_HIDDEN_FIELDS,
  },

  async setup(options, nuxt) {
    const prefix = options.endpointPrefix || '/api/_nac'
    const resolver = createResolver(import.meta.url)

    // 1. Aliases
    nuxt.options.alias['#site/schema'] = resolver.resolve(nuxt.options.rootDir, options.schemaPath!)
    nuxt.options.alias['#nac/shared'] = resolver.resolve('./runtime/shared')

    // 2. Runtime Config (The Concrete State)
    const { schemaPath, auth, apiHiddenFields, ...publicOptions } = options
    nuxt.options.runtimeConfig.autoCrud = { schemaPath, auth, apiHiddenFields } // private runtime
    nuxt.options.runtimeConfig.public.autoCrud = publicOptions // public runtime

    // 3. Auto-imports (The Engine)
    addImportsDir(resolver.resolve('./runtime/composables'))
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))

    // 4. Global Type Support (For the Playground/App)
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolver.resolve('./runtime/types/index.d.ts') })
    })

    // 5. Register the Security Guard (Intercepter)
    addServerHandler({
      middleware: true,
      handler: resolver.resolve('./runtime/server/middleware/nac-guard.ts'),
    })

    // 6. Register Specific System Endpoints (Targets)
    const apiDir = resolver.resolve('./runtime/server/api/_nac')
    const routes = [
      // System Endpoints
      { path: '/_meta', method: 'get', handler: '_meta.get.ts' },
      { path: '/_sse', method: 'get', handler: '_sse.get.ts' },
      { path: '/_relations', method: 'get', handler: '_relations.get.ts' },
      { path: '/_relations/:model', method: 'get', handler: '_relations/[model].get.ts' },
      { path: '/_schemas', method: 'get', handler: '_schemas.get.ts' },
      { path: '/_schemas/:model', method: 'get', handler: '_schemas/[model].get.ts' },
      // Dynamic CRUD Endpoints
      { path: '/:model', method: 'get', handler: '[model]/index.get.ts' },
      { path: '/:model', method: 'post', handler: '[model]/index.post.ts' },
      { path: '/:model/:id', method: 'get', handler: '[model]/[id].get.ts' },
      { path: '/:model/:id', method: 'patch', handler: '[model]/[id].patch.ts' },
      { path: '/:model/:id', method: 'delete', handler: '[model]/[id].delete.ts' },
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
