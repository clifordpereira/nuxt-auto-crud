import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
    'nuxt-auth-utils',
    'nuxt-authorization',
    '@nuxthub/core',
  ],
  runtimeConfig: {
    session: {
      password: 'password-must-be-at-least-32-characters-long-right',
    },
  },
  alias: {
    'hub:db': fileURLToPath(new URL('./server/utils/db.ts', import.meta.url)),
  },
  hooks: {
    'nitro:config': (nitroConfig) => {
      nitroConfig.plugins = nitroConfig.plugins || []
      nitroConfig.plugins.unshift(fileURLToPath(new URL('./server/plugins/mock-hub.ts', import.meta.url)))
    },
  },
})
