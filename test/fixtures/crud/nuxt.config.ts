import { fileURLToPath } from 'node:url'
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    'nuxt-auth-utils',
    'nuxt-authorization',
    MyModule,
  ],
  alias: {
    '#authorization': fileURLToPath(new URL('./auth-mock.ts', import.meta.url)),
  },
  hub: {
    db: 'sqlite',
  },
  autoCrud: {
    schemaPath: 'server/db/schema',
  },
})
