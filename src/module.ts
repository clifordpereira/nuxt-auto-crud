import {
  defineNuxtModule,
  createResolver,
  addServerHandler,
  addServerImportsDir,
  addImportsDir,
} from '@nuxt/kit'

import { SYSTEM_USER_FIELDS, PROTECTED_FIELDS, HIDDEN_FIELDS } from './runtime/server/utils/constants'
import type { ModuleOptions } from './types'

export type { ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-auto-crud',
    configKey: 'autoCrud',
  },
  defaults: {
    endpointPrefix: '/api/nac',
    schemaPath: 'server/db/schema',
    hashedFields: ['password'],
    systemUserFields: SYSTEM_USER_FIELDS,
    protectedFields: PROTECTED_FIELDS,
    hiddenFields: HIDDEN_FIELDS,
    auth: {
      authentication: false,
      authorization: false,
    },
    resources: {}
  },

  async setup(options, nuxt) {
    const prefix = options.endpointPrefix || '/api/nac'
    const resolver = createResolver(import.meta.url)

    // 1. Schema Alias
    nuxt.options.alias['#site/schema'] = resolver.resolve(
      nuxt.options.rootDir, 
      options.schemaPath!
    )

    // 2. Runtime Config (The Concrete State)
    const { schemaPath, hashedFields, auth, ...publicOptions } = options
    // Assign to private runtime
    nuxt.options.runtimeConfig.autoCrud = {
      schemaPath,
      hashedFields,
      auth
    }
    // Assign to public runtime
    nuxt.options.runtimeConfig.public.autoCrud = publicOptions

    // 3. Auto-imports (The Engine)
    addImportsDir(resolver.resolve('./runtime/composables'))
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))

    // 4. Global Type Support (For the Playground/App)
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolver.resolve('./runtime/types/index.d.ts') })
    })

    const apiDir = resolver.resolve('./runtime/server/api/nac')
    const routes = [
      // System Endpoints
      { path: '/_meta', method: 'get', handler: '_meta.get.ts' },
      { path: '/sse', method: 'get', handler: 'sse.get.ts' },
      { path: '/_relations', method: 'get', handler: '_relations.get.ts' },
      { path: '/_schema', method: 'get', handler: '_schema/index.get.ts' },
      { path: '/_schema/:table', method: 'get', handler: '_schema/[table].get.ts' },
      // Dynamic CRUD Endpoints
      { path: '/:model', method: 'get', handler: '[model]/index.get.ts' },
      { path: '/:model', method: 'post', handler: '[model]/index.post.ts' },
      { path: '/:model/:id', method: 'get', handler: '[model]/[id].get.ts' },
      { path: '/:model/:id', method: 'patch', handler: '[model]/[id].patch.ts' },
      { path: '/:model/:id', method: 'delete', handler: '[model]/[id].delete.ts' }
    ] as const;

    for (const route of routes) {
      addServerHandler({
        route: `${prefix}${route.path}`,
        method: route.method,
        handler: resolver.resolve(apiDir, route.handler),
      })
    }
  },
})
