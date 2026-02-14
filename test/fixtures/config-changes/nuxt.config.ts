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
  hub: {
    db: 'sqlite',
    kv: true,
  },
})
