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

    const apiDir = resolver.resolve('./runtime/server/api')

    // Standardized System Endpoints
    const systemRoutes = [
      { path: '/_meta', handler: '_meta.get' },
      { path: '/sse', handler: 'sse.get' },
      { path: '/_relations', handler: '_relations.get' },
      { path: '/_schema', handler: '_schema/index.get' },
      { path: '/_schema/:table', handler: '_schema/[table].get' }
    ]

    for (const route of systemRoutes) {
      addServerHandler({
        route: `${prefix}${route.path}`,
        method: 'get',
        handler: resolver.resolve(apiDir, route.handler),
      })
    }

    // Dynamic CRUD APIs
    addServerHandler({
      route: `${prefix}/:model`,
      method: 'get',
      handler: resolver.resolve(apiDir, '[model]/index.get'),
    })
    addServerHandler({
      route: `${prefix}/:model`,
      method: 'post',
      handler: resolver.resolve(apiDir, '[model]/index.post'),
    })
    addServerHandler({
      route: `${prefix}/:model/:id`,
      method: 'get',
      handler: resolver.resolve(apiDir, '[model]/[id].get'),
    })
    addServerHandler({
      route: `${prefix}/:model/:id`,
      method: 'patch',
      handler: resolver.resolve(apiDir, '[model]/[id].patch'),
    })
    addServerHandler({
      route: `${prefix}/:model/:id`,
      method: 'delete',
      handler: resolver.resolve(apiDir, '[model]/[id].delete'),
    })
  },
})
