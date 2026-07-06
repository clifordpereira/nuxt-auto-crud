export default defineNuxtConfig({
  modules: ['../src/module', '@nuxthub/core'],
  devtools: { enabled: true },
  compatibilityDate: '2025-07-15',
  hub: {
    db: 'sqlite',
  },
})
