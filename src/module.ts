import {
  defineNuxtModule,
  createResolver,
  addServerHandler,
  addServerImportsDir,
  addImportsDir,
  addServerPlugin,
} from '@nuxt/kit'

import type { ModuleOptions, AuthOptions, RuntimeModuleOptions } from './types'

export type { ModuleOptions }

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    autoCrud: RuntimeModuleOptions
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-auto-crud',
    configKey: 'autoCrud',
  },
  defaults: {
    schemaPath: 'server/database/schema',
    drizzlePath: 'server/utils/drizzle',
    auth: false,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // 1. Alias the schema so the runtime code can import it
    // We map '#site/schema' to the user's actual schema file
    const schemaPath = resolver.resolve(
      nuxt.options.rootDir,
      options.schemaPath!,
    )
    nuxt.options.alias['#site/schema'] = schemaPath

    const drizzlePath = resolver.resolve(
      nuxt.options.rootDir,
      options.drizzlePath!,
    )
    nuxt.options.alias['#site/drizzle'] = drizzlePath

    // Ensure #authorization alias exists for the runtime
    // This resolves warnings when building the module files
    nuxt.options.alias['#authorization'] = nuxt.options.alias['#authorization'] || 'nuxt-authorization/utils'

    // 3. Load dedicated config (autocrud.config.ts)
    const { loadConfig } = await import('c12')
    const { config: externalConfig } = await loadConfig<ModuleOptions>({
      name: 'autocrud',
      cwd: nuxt.options.rootDir,
    })

    // Merge options: Inline options take precedence over external config?
    // Usually external config is base, inline overrides.
    // But here, resources might be merged deeply.
    // For simplicity, we'll do a shallow merge of top-level keys,
    // but for 'resources', we might want to merge them if both exist.
    // Let's use defu or simple spread for now.

    let mergedAuth: AuthOptions = {
      authentication: false,
      authorization: false,
      type: 'session',
    }

    if (options.auth === true) {
      mergedAuth = {
        authentication: true,
        authorization: true,
        type: 'session',
        ...(typeof externalConfig?.auth === 'object' ? externalConfig.auth : {}),
      }
    }
    else if (options.auth === false) {
      mergedAuth = {
        authentication: false,
        authorization: false,
        type: 'session',
      }
    }
    else {
      // It's an object or undefined
      mergedAuth = {
        authentication: true, // Default to true if object provided? Or undefined?
        // If options.auth is undefined, we might want defaults.
        // But if defaults say auth: false, then options.auth might be undefined.
        // Let's stick to the plan: default is false.
        ...(typeof externalConfig?.auth === 'object' ? externalConfig.auth : {}),
        ...(typeof options.auth === 'object' ? options.auth : {}),
      }
      // If authentication is missing, default to false?
      // The user wants "auth: false or AuthOption, default: false"
      if (mergedAuth.authentication === undefined) {
        mergedAuth.authentication = false
      }
    }

    const mergedResources = {
      ...externalConfig?.resources,
      ...options.resources,
    }

    // Pass options to runtimeConfig
    nuxt.options.runtimeConfig.autoCrud = {
      auth: {
        authentication: mergedAuth.authentication ?? false,
        authorization: mergedAuth.authorization ?? false,
        type: mergedAuth.type ?? 'session',
        jwtSecret: mergedAuth.jwtSecret,
      },
      resources: mergedResources || {},
    }

    // 2. Register the API routes
    // We scan the runtime/server/api directory and add handlers
    // Note: addServerHandler is usually for specific files, but for a folder structure
    // we want Nitro to scan it. We can add the directory to nitro.serverAssets or handlers.
    // Actually, the easiest way for file-based routing is to add to server handlers manually
    // or let Nitro scan the directory if we add it to imports? No, imports are for utils.

    // For API routes (server/api), we need to register them as event handlers
    const apiDir = resolver.resolve('./runtime/server/api')

    // Register system APIs
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

    // We register the dynamic model handler
    // Since it's a dynamic route [model], we register it carefully
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

    // 3. Register Utils (modelMapper)
    // This allows the API handlers to use getTableForModel, etc.
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))

    // 4. Register Composables
    addImportsDir(resolver.resolve('./runtime/composables'))

    // 5. Register Plugins
    addServerPlugin(resolver.resolve('./runtime/server/plugins/seed'))

    console.log('🚀 Auto CRUD module loaded!')
    console.log(`   - Schema: ${options.schemaPath}`)
    console.log(`   - API: /api/[model]`)
  },
})
