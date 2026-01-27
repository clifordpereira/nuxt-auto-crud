import { fileURLToPath } from 'node:url'
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    MyModule,
  ],
  hub: { database: true, kv: true },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2026-01-26',
})