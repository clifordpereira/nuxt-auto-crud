import { defineNuxtModule, createResolver, addServerHandler, addServerImportsDir } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Path to the database schema file
   * @default 'server/database/schema'
   */
  schemaPath?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-auto-crud',
    configKey: 'autoCrud'
  },
  defaults: {
    schemaPath: 'server/database/schema'
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // 1. Alias the schema so the runtime code can import it
    // We map '#site/schema' to the user's actual schema file
    const schemaPath = resolver.resolve(nuxt.options.rootDir, options.schemaPath!)
    nuxt.options.alias['#site/schema'] = schemaPath

    // 2. Register the API routes
    // We scan the runtime/server/api directory and add handlers
    // Note: addServerHandler is usually for specific files, but for a folder structure
    // we want Nitro to scan it. We can add the directory to nitro.serverAssets or handlers.
    // Actually, the easiest way for file-based routing is to add to server handlers manually
    // or let Nitro scan the directory if we add it to imports? No, imports are for utils.
    
    // For API routes (server/api), we need to register them as event handlers
    const apiDir = resolver.resolve('./runtime/server/api')
    
    // We register the dynamic model handler
    // Since it's a dynamic route [model], we register it carefully
    addServerHandler({
      route: '/api/:model',
      method: 'get',
      handler: resolver.resolve(apiDir, '[model]/index.get.ts')
    })
    addServerHandler({
      route: '/api/:model',
      method: 'post',
      handler: resolver.resolve(apiDir, '[model]/index.post.ts')
    })
    addServerHandler({
      route: '/api/:model/:id',
      method: 'get',
      handler: resolver.resolve(apiDir, '[model]/[id].get.ts')
    })
    addServerHandler({
      route: '/api/:model/:id',
      method: 'patch',
      handler: resolver.resolve(apiDir, '[model]/[id].patch.ts')
    })
    addServerHandler({
      route: '/api/:model/:id',
      method: 'delete',
      handler: resolver.resolve(apiDir, '[model]/[id].delete.ts')
    })

    // 3. Register Utils (modelMapper)
    // This allows the API handlers to use getTableForModel, etc.
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))
    
    console.log('🚀 Auto CRUD module loaded!')
    console.log(`   - Schema: ${options.schemaPath}`)
    console.log(`   - API: /api/[model]`)
  }
})