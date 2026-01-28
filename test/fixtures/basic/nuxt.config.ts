import { defineNuxtConfig } from 'nuxt/config'
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    MyModule,
  ],
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2026-01-26',
  nitro: {
    alias: {
      'hub:db': './node_modules/@nuxthub/db/db.mjs'
    }
  }
})