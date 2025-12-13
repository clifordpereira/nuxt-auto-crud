import {
  defineNuxtModule,
  createResolver,
  addServerHandler,
  addServerImportsDir,
  addImportsDir,
  hasNuxtModule,
  addServerImports,
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
    schemaPath: 'server/db/schema',

    auth: false,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    const schemaPath = resolver.resolve(
      nuxt.options.rootDir,
      options.schemaPath!,
    )
    nuxt.options.alias['#site/schema'] = schemaPath



    addImportsDir(resolver.resolve(nuxt.options.rootDir, 'shared/utils'))

    // Add stubs for optional modules
    const stubsPath = resolver.resolve('./runtime/server/stubs/auth')
    if (!hasNuxtModule('nuxt-auth-utils')) {
      addServerImports([
        { name: 'requireUserSession', from: stubsPath },
        { name: 'getUserSession', from: stubsPath },
        { name: 'hashPassword', from: stubsPath },
      ])
    }
    if (!hasNuxtModule('nuxt-authorization')) {
      addServerImports([
        { name: 'allows', from: stubsPath },
        { name: 'abilities', from: stubsPath },
        { name: 'abilityLogic', from: stubsPath },
      ])
    }

    nuxt.options.alias['#authorization'] ||= 'nuxt-authorization/utils'

    const mergedAuth: AuthOptions = options.auth === false
      ? { authentication: false, authorization: false, type: 'session' }
      : {
          authentication: true,
          authorization: options.auth === true,
          type: 'session',

          ...(typeof options.auth === 'object' ? options.auth : {}),
        }

    nuxt.options.runtimeConfig.autoCrud = {
      auth: {
        authentication: mergedAuth.authentication ?? false,
        authorization: mergedAuth.authorization ?? false,
        type: mergedAuth.type ?? 'session',
        jwtSecret: mergedAuth.jwtSecret,
      },
      resources: {
        ...options.resources,
      },
      hashedFields: options.hashedFields ?? ['password'],
    }

    const apiDir = resolver.resolve('./runtime/server/api')

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

    addServerImportsDir(resolver.resolve('./runtime/server/utils'))

    addImportsDir(resolver.resolve('./runtime/composables'))
  },
})
