// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['../src/module', '@nuxthub/core'],
  hub: { db: 'sqlite', kv: true }
})