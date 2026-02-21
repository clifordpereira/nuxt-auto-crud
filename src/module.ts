import { defineNuxtModule, createResolver, addServerHandler, addServerImportsDir, addImportsDir } from '@nuxt/kit'

import { NAC_API_HIDDEN_FIELDS, NAC_FORM_HIDDEN_FIELDS } from './runtime/server/utils/constants'

import type { ModuleOptions } from './types'

export type { ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-auto-crud',
    configKey: 'autoCrud',
  },
  defaults: {
    // Private config
    realtime: false,
    auth: {
      authentication: false,
      authorization: false,
      ownerKey: 'createdBy',
    },
    publicResources: {},
    apiHiddenFields: NAC_API_HIDDEN_FIELDS,
    agenticToken: '',
    schemaPath: 'server/db/schema',
    // Public config
    formHiddenFields: NAC_FORM_HIDDEN_FIELDS,
    nacEndpointPrefix: '/api/_nac',
  },

  async setup(options, nuxt) {
    const prefix = options.nacEndpointPrefix || '/api/_nac'
    const resolver = createResolver(import.meta.url)

    // 1. Aliases
    nuxt.options.alias['#nac/shared'] = resolver.resolve('./runtime/shared')
    nuxt.options.alias['#nac/types'] = resolver.resolve('./runtime/server/types')
    nuxt.options.alias['#nac/schema'] = resolver.resolve(nuxt.options.rootDir, options.schemaPath!)

    // 2. Runtime Config (The Concrete State)
    const { formHiddenFields, nacEndpointPrefix, ...privateOptions } = options
    nuxt.options.runtimeConfig.autoCrud = privateOptions // private runtime
    nuxt.options.runtimeConfig.public.autoCrud = { formHiddenFields, nacEndpointPrefix } // public runtime

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
      handler: resolver.resolve('./runtime/server/middleware/nac-guard'),
    })

    // 6. Register Specific System Endpoints (Targets)
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
