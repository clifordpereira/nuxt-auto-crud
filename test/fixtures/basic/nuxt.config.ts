import { defineNuxtConfig } from 'nuxt/config'
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    MyModule,
  ],
  // hub: { db: true, kv: true },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2026-01-26',
})