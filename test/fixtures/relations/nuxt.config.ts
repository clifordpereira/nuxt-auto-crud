import MyModule from '../../../src/module'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    MyModule,
  ],
  compatibilityDate: '2026-05-12',
  hub: {
    db: 'sqlite',
  },
  autoCrud: {
    relationsPath: 'server/db/relations',
  },
})
