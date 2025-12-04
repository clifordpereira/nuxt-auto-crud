import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
    'nuxt-auth-utils',
    '@nuxthub/core',
  ],
  runtimeConfig: {
    session: {
      password: 'password-must-be-at-least-32-characters-long-right',
    },
  },
  hooks: {
    'nitro:config': (nitroConfig) => {
      nitroConfig.plugins = nitroConfig.plugins || []
      nitroConfig.plugins.unshift(fileURLToPath(new URL('./server/plugins/mock-hub.ts', import.meta.url)))
    },
  },
})
