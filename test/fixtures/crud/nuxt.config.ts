import { fileURLToPath } from 'node:url'
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    'nuxt-auth-utils',
    'nuxt-authorization',
    MyModule,
  ],
  hub: {
    database: true,
  },
  autoCrud: {
    schemaPath: 'server/database/schema',
  },
  alias: {
    '#authorization': fileURLToPath(new URL('./auth-mock.ts', import.meta.url)),
  },
})
