import {
  defineNuxtModule,
  createResolver,
  addServerHandler,
  addServerImportsDir,
  addImportsDir,
} from '@nuxt/kit'

import type { ModuleOptions, RuntimeModuleOptions } from './types'

export type { ModuleOptions }

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    autoCrud: RuntimeModuleOptions
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-auto-crud',
    configKey: 'autoCrud',
  },
  defaults: {
    schemaPath: 'server/db/schema',
    hashedFields: ['password'],
    auth: {
      authentication: true,
      authorization: true,
      abilityPath: 'server/utils/abilities',
    }
  },

  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // 1. Aliases (The Interface)
    // Bridge: Schema Alias
    nuxt.options.alias['#site/schema'] = resolver.resolve(
      nuxt.options.rootDir, 
      options.schemaPath!
    )

    // Bridge: Ability Alias (Uses merged default if not provided)
    nuxt.options.alias['#site/ability'] = resolver.resolve(
      nuxt.options.rootDir, 
      options.auth!.abilityPath!
    )

    // 2. Runtime Config (The Concrete State)
    nuxt.options.runtimeConfig.public.autoCrud = options as RuntimeModuleOptions

    // 3. Auto-imports (The Engine)
    addImportsDir(resolver.resolve('./runtime/composables'))
    addImportsDir(resolver.resolve(nuxt.options.rootDir, 'shared/utils'))
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))

    // 4. Register the IoC Contract Types
    // This ensures event.context.$authorization is typed in the core module logic
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.typescript ||= {}
      nitroConfig.typescript.tsConfig ||= {}
      
      nitroConfig.typescript.tsConfig.include = [
        ...(nitroConfig.typescript.tsConfig.include || []),
        resolver.resolve('./runtime/types/index.d.ts')
      ]
    })

    // 5. Global Type Support (For the Playground/App)
    // This makes the types visible to the IDE in the playground
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolver.resolve('./runtime/types/index.d.ts') })
    })

    const apiDir = resolver.resolve('./runtime/server/api')

    // Meta Discovery API for AI Agents
    addServerHandler({
      route: '/api/_meta',
      method: 'get',
      handler: resolver.resolve(apiDir, '_meta.get'),
    })
    // SSE for real time updates
    addServerHandler({
      route: '/api/sse',
      method: 'get',
      handler: resolver.resolve(apiDir, 'sse'),
    })
    // Helper APIs for Dynamic CRUD
    addServerHandler({
      route: '/api/_schema',
      method: 'get',
      handler: resolver.resolve(apiDir, '_schema/index.get'),
    })
    addServerHandler({
      route: '/api/_schema/:table',
      method: 'get',
      handler: resolver.resolve(apiDir, '_schema/[table].get'),
    })
    addServerHandler({
      route: '/api/_relations',
      method: 'get',
      handler: resolver.resolve(apiDir, '_relations.get'),
    })
    // Dynamic CRUD APIs
    addServerHandler({
      route: '/api/:model',
      method: 'get',
      handler: resolver.resolve(apiDir, '[model]/index.get'),
    })
    addServerHandler({
      route: '/api/:model',
      method: 'post',
      handler: resolver.resolve(apiDir, '[model]/index.post'),
    })
    addServerHandler({
      route: '/api/:model/:id',
      method: 'get',
      handler: resolver.resolve(apiDir, '[model]/[id].get'),
    })
    addServerHandler({
      route: '/api/:model/:id',
      method: 'patch',
      handler: resolver.resolve(apiDir, '[model]/[id].patch'),
    })
    addServerHandler({
      route: '/api/:model/:id',
      method: 'delete',
      handler: resolver.resolve(apiDir, '[model]/[id].delete'),
    })
  },
})
